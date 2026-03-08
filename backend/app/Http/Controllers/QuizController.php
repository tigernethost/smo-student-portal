<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\QuizQuestion;
use App\Models\QuizSession;
use App\Models\Subject;
use App\Models\Topic;
use App\Services\AIService;
use App\Services\AIQuotaService;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function __construct(
        private AIService $ai,
        private AnalyticsService $analytics,
        private AIQuotaService $quota
    ) {}

    // POST /api/quiz/generate  — start a new AI-generated quiz
    public function generate(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'source' => 'nullable|in:manual,ai_recommended,upload_followup',
            'num_questions' => 'nullable|integer|min:5|max:20',
            'upload_id' => 'nullable|exists:student_uploads,id',
        ]);

        $user = $request->user();

        // ── AI Quota Check ────────────────────────────────────────────────────
        $quotaCheck = $this->quota->check($user);
        if (!$quotaCheck['allowed']) {
            return response()->json([
                'error'        => 'quota_exceeded',
                'message'      => $quotaCheck['message'],
                'quota'        => $this->quota->status($user),
                'upgrade_url'  => '/upgrade',
            ], 402);
        }
        // ─────────────────────────────────────────────────────────────────────

        $subject = Subject::findOrFail($request->subject_id);
        $topic = $request->topic_id ? Topic::find($request->topic_id) : null;
        $numQ = $request->num_questions ?? 10;

        // If no topic specified, pick weakest topic for this subject
        if (!$topic) {
            $topic = Topic::where('subject_id', $subject->id)
                ->orderBy('sort_order')
                ->first();
        }

        // Generate quiz via AI
        try {
            $quizData = $this->ai->generateQuiz(
                $subject->name,
                $topic?->name ?? $subject->name,
                $user->grade_level ?? 8,
                $numQ
            );
        } catch (\Exception $e) {
            \Log::error('Quiz AI failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Quiz generation failed', 'debug' => $e->getMessage()], 500);
        }

        if (empty($quizData['questions'])) {
            return response()->json(['message' => 'Failed to generate quiz — AI returned empty'], 500);
        }

        // ── Consume one AI action ─────────────────────────────────────────────
        $this->quota->consume($user, 'quiz', 800, 1500);
        // ─────────────────────────────────────────────────────────────────────

        // Save session
        $session = QuizSession::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'topic_id' => $topic?->id,
            'upload_id' => $request->upload_id,
            'source' => $request->source ?? 'manual',
            'total_questions' => count($quizData['questions']),
            'status' => 'active',
        ]);

        // Save questions
        foreach ($quizData['questions'] as $q) {
            QuizQuestion::create([
                'quiz_session_id' => $session->id,
                'topic_id' => $topic?->id,
                'question_number' => $q['number'],
                'question' => $q['question'],
                'choices' => $q['choices'],
                'correct_answer' => $q['correct'],
                'explanation' => $q['explanation'] ?? null,
            ]);
        }

        $questions = $session->questions()->orderBy('question_number')->get();

        return response()->json([
            'session_id' => $session->id,
            'subject' => $subject->name,
            'topic' => $topic?->name,
            'total_questions' => $session->total_questions,
            'questions' => $questions->map(fn($q) => [
                'id' => $q->id,
                'number' => $q->question_number,
                'question' => $q->question,
                'choices' => $q->choices,
                // Do NOT expose correct_answer here
            ]),
            'quota' => $this->quota->status($user),
        ]);
    }

    // POST /api/quiz/{sessionId}/answer  — submit a single answer
    public function answer(Request $request, $sessionId)
    {
        $request->validate([
            'question_id' => 'required|exists:quiz_questions,id',
            'answer' => 'required|in:A,B,C,D',
        ]);

        $session = QuizSession::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->findOrFail($sessionId);

        $question = QuizQuestion::where('quiz_session_id', $session->id)
            ->findOrFail($request->question_id);

        $isCorrect = strtoupper($request->answer) === strtoupper($question->correct_answer);

        $question->update([
            'student_answer' => $request->answer,
            'is_correct' => $isCorrect,
        ]);

        $session->increment('answered');
        if ($isCorrect) $session->increment('correct');

        return response()->json([
            'is_correct' => $isCorrect,
            'correct_answer' => $question->correct_answer,
            'explanation' => $question->explanation,
        ]);
    }

    // POST /api/quiz/{sessionId}/finish  — finish quiz and get results
    public function finish(Request $request, $sessionId)
    {
        $session = QuizSession::with(['questions', 'subject', 'topic'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($sessionId);

        $scorePct = $session->total_questions > 0
            ? round(($session->correct / $session->total_questions) * 100, 1)
            : 0;

        $session->update([
            'status' => 'completed',
            'score_pct' => $scorePct,
            'answered' => $session->total_questions,
        ]);

        // Update mastery
        if ($session->topic_id) {
            $this->analytics->updateMasteryFromQuiz(
                $request->user()->id,
                $session->topic_id,
                $session->correct,
                $session->total_questions
            );
        }

        // Regenerate analytics async (simple sync for now)
        try { $this->analytics->generateSnapshot($request->user()->id); } catch (\Exception $e) {}

        // Achievement notification
        if ($scorePct >= 85) {
            Notification::create([
                'user_id' => $request->user()->id,
                'type' => 'achievement',
                'title' => '🌟 Great job!',
                'message' => "You scored {$scorePct}% on " . ($session->topic?->name ?? $session->subject?->name ?? 'this topic') . "!",
                'icon' => '🌟',
                'link' => "/quiz/{$session->id}/results",
            ]);
        } elseif ($scorePct < 60) {
            Notification::create([
                'user_id' => $request->user()->id,
                'type' => 'recommendation',
                'title' => 'Need more practice',
                'message' => "You scored {$scorePct}% on {$session->topic?->name}. Review the topic and try again!",
                'icon' => '📚',
                'link' => "/learning-path",
            ]);
        }

        $questions = $session->questions()->orderBy('question_number')->get();

        return response()->json([
            'session_id' => $session->id,
            'score' => $session->correct,
            'total' => $session->total_questions,
            'score_pct' => $scorePct,
            'subject' => $session->subject?->name,
            'topic' => $session->topic?->name,
            'questions' => $questions->map(fn($q) => [
                'number' => $q->question_number,
                'question' => $q->question,
                'choices' => $q->choices,
                'correct_answer' => $q->correct_answer,
                'student_answer' => $q->student_answer,
                'is_correct' => $q->is_correct,
                'explanation' => $q->explanation,
            ]),
        ]);
    }

    // GET /api/quiz/history
    public function history(Request $request)
    {
        $sessions = QuizSession::with(['subject', 'topic'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($sessions);
    }

    // GET /api/quiz/{sessionId}/results
    public function results(Request $request, $sessionId)
    {
        $session = QuizSession::with(['questions', 'subject', 'topic'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($sessionId);

        return response()->json($session);
    }
}
