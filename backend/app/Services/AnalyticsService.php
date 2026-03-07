<?php

namespace App\Services;

use App\Models\AnalyticsSnapshot;
use App\Models\Notification;
use App\Models\Recommendation;
use App\Models\StudentTopicMastery;
use App\Models\QuizSession;
use App\Models\StudentUpload;

class AnalyticsService
{
    public function __construct(private AIService $ai) {}

    // ── Main entry point — recompute everything for a student ────────────
    public function generateSnapshot(int $userId): AnalyticsSnapshot
    {
        $masteries = StudentTopicMastery::with('topic.subject')
            ->where('user_id', $userId)
            ->get();

        $quizSessions = QuizSession::where('user_id', $userId)
            ->where('status', 'completed')
            ->get();

        $uploads = StudentUpload::where('user_id', $userId)
            ->where('status', 'done')
            ->get();

        // ── Compute subject-level scores ─────────────────────────────────
        $subjectScores = [];
        $subjectGroups = $masteries->groupBy(fn($m) => $m->topic->subject_id);

        foreach ($subjectGroups as $subjectId => $items) {
            $scored = $items->filter(fn($m) => $m->attempts > 0);
            if ($scored->isEmpty()) continue;
            $subjectScores[$subjectId] = round($scored->avg('mastery_score'), 1);
        }

        // Factor in upload scores
        foreach ($uploads as $upload) {
            if ($upload->subject_id && $upload->extracted_score !== null && $upload->extracted_total > 0) {
                $uploadPct = ($upload->extracted_score / $upload->extracted_total) * 100;
                $sid = $upload->subject_id;
                $subjectScores[$sid] = isset($subjectScores[$sid])
                    ? round(($subjectScores[$sid] + $uploadPct) / 2, 1)
                    : round($uploadPct, 1);
            }
        }

        $overallScore = empty($subjectScores) ? 0 : round(array_sum($subjectScores) / count($subjectScores), 1);

        // ── Strengths (mastery >= 80, enough attempts) ───────────────────
        $strengths = $masteries
            ->filter(fn($m) => $m->mastery_score >= 80 && $m->attempts >= 2)
            ->sortByDesc('mastery_score')
            ->take(5)
            ->map(fn($m) => [
                'topic_id' => $m->topic_id,
                'topic_name' => $m->topic->name,
                'subject_name' => $m->topic->subject->name,
                'score' => $m->mastery_score,
            ])->values()->toArray();

        // ── Weaknesses (mastery < 65, has attempts) ──────────────────────
        $weaknesses = $masteries
            ->filter(fn($m) => $m->mastery_score < 65 && $m->attempts >= 1)
            ->sortBy('mastery_score')
            ->take(5)
            ->map(fn($m) => [
                'topic_id' => $m->topic_id,
                'topic_name' => $m->topic->name,
                'subject_name' => $m->topic->subject->name,
                'score' => $m->mastery_score,
            ])->values()->toArray();

        // Also add weak topics from uploads
        foreach ($uploads as $upload) {
            if ($upload->weak_topics) {
                foreach ($upload->weak_topics as $wt) {
                    if (!collect($weaknesses)->contains('topic_name', $wt)) {
                        $weaknesses[] = ['topic_name' => $wt, 'subject_name' => $upload->extracted_subject ?? 'Unknown', 'from_upload' => true];
                    }
                }
            }
        }

        // ── At-risk: was higher, now falling ────────────────────────────
        $atRisk = $masteries
            ->filter(fn($m) => $m->attempts >= 3 && $m->mastery_score < 70 && $m->incorrect > $m->correct)
            ->map(fn($m) => ['topic_id' => $m->topic_id, 'topic_name' => $m->topic->name, 'score' => $m->mastery_score])
            ->values()->toArray();

        // ── Risk level ───────────────────────────────────────────────────
        $riskLevel = 'low';
        if ($overallScore < 75 || count($atRisk) >= 3) $riskLevel = 'high';
        elseif ($overallScore < 85 || count($weaknesses) >= 3) $riskLevel = 'medium';

        // ── Recommended topics (weak + available, highest priority first) ─
        $recommended = $masteries
            ->filter(fn($m) => in_array($m->status, ['available', 'in-progress']) || ($m->mastery_score < 70 && $m->attempts > 0))
            ->sortBy('mastery_score')
            ->take(4)
            ->map(fn($m) => ['topic_id' => $m->topic_id, 'topic_name' => $m->topic->name, 'subject_name' => $m->topic->subject->name, 'score' => $m->mastery_score])
            ->values()->toArray();

        // ── Generate AI summary ──────────────────────────────────────────
        $aiSummary = null;
        if ($overallScore > 0) {
            try {
                $aiSummary = $this->ai->generateStudentSummary([
                    'overall_score' => $overallScore,
                    'subject_scores' => $subjectScores,
                    'top_strength' => $strengths[0]['topic_name'] ?? null,
                    'top_weakness' => $weaknesses[0]['topic_name'] ?? null,
                    'risk_level' => $riskLevel,
                    'total_quizzes' => $quizSessions->count(),
                    'total_uploads' => $uploads->count(),
                ]);
            } catch (\Exception $e) {
                $aiSummary = null;
            }
        }

        // ── Save snapshot ────────────────────────────────────────────────
        $snapshot = AnalyticsSnapshot::updateOrCreate(
            ['user_id' => $userId],
            [
                'overall_score' => $overallScore,
                'subject_scores' => $subjectScores,
                'strengths' => $strengths,
                'weaknesses' => $weaknesses,
                'at_risk_topics' => $atRisk,
                'recommended_topics' => $recommended,
                'total_quizzes' => $quizSessions->count(),
                'total_uploads' => $uploads->count(),
                'risk_level' => $riskLevel,
                'ai_summary' => $aiSummary,
            ]
        );

        // ── Regenerate recommendations ───────────────────────────────────
        $this->regenerateRecommendations($userId, $weaknesses, $recommended, $riskLevel);

        // ── Fire notifications if needed ─────────────────────────────────
        $this->checkAndNotify($userId, $riskLevel, $weaknesses, $snapshot);

        return $snapshot;
    }

    // ── Update mastery after a quiz ──────────────────────────────────────
    public function updateMasteryFromQuiz(int $userId, int $topicId, int $correct, int $total): void
    {
        $mastery = StudentTopicMastery::firstOrCreate(
            ['user_id' => $userId, 'topic_id' => $topicId],
            ['mastery_score' => 0, 'attempts' => 0, 'correct' => 0, 'incorrect' => 0, 'status' => 'available']
        );

        $scorePct = ($correct / $total) * 100;

        // Weighted average: new score has 40% weight, history has 60%
        $newScore = $mastery->attempts === 0
            ? $scorePct
            : ($mastery->mastery_score * 0.6) + ($scorePct * 0.4);

        $status = match(true) {
            $newScore >= 85 => 'mastered',
            $newScore >= 65 => 'in-progress',
            $mastery->attempts >= 2 && $newScore < 60 => 'at-risk',
            default => 'in-progress',
        };

        $mastery->update([
            'mastery_score' => round($newScore, 2),
            'attempts' => $mastery->attempts + 1,
            'correct' => $mastery->correct + $correct,
            'incorrect' => $mastery->incorrect + ($total - $correct),
            'status' => $status,
            'last_attempted_at' => now(),
        ]);
    }

    // ── Update mastery from upload weak topics ────────────────────────────
    public function updateMasteryFromUpload(int $userId, array $weakTopics, ?int $subjectId): void
    {
        if (!$subjectId || empty($weakTopics)) return;

        foreach ($weakTopics as $topicName) {
            $topic = \App\Models\Topic::where('subject_id', $subjectId)
                ->where('name', 'like', '%' . $topicName . '%')
                ->first();

            if ($topic) {
                StudentTopicMastery::firstOrCreate(
                    ['user_id' => $userId, 'topic_id' => $topic->id],
                    ['mastery_score' => 45, 'attempts' => 1, 'correct' => 0, 'incorrect' => 1, 'status' => 'at-risk']
                );
            }
        }
    }

    private function regenerateRecommendations(int $userId, array $weaknesses, array $recommended, string $riskLevel): void
    {
        // Clear old unacted recommendations
        Recommendation::where('user_id', $userId)->where('is_acted', false)->delete();

        foreach (array_slice($weaknesses, 0, 3) as $w) {
            $tid = $w['topic_id'] ?? null;
            Recommendation::create([
                'user_id' => $userId,
                'topic_id' => $tid,
                'priority' => $riskLevel === 'high' ? 'high' : 'medium',
                'type' => 'quiz',
                'reason' => "Your score in {$w['topic_name']} is below the mastery threshold. Take a focused quiz to improve.",
            ]);
        }

        foreach (array_slice($recommended, 0, 2) as $r) {
            if (isset($r['topic_id'])) {
                Recommendation::create([
                    'user_id' => $userId,
                    'topic_id' => $r['topic_id'],
                    'priority' => 'low',
                    'type' => 'study',
                    'reason' => "You're making progress in {$r['topic_name']}. Keep going to reach mastery.",
                ]);
            }
        }
    }

    private function checkAndNotify(int $userId, string $riskLevel, array $weaknesses, AnalyticsSnapshot $snapshot): void
    {
        if ($riskLevel === 'high' && !empty($weaknesses)) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'alert',
                'title' => 'Action Needed',
                'message' => "You have " . count($weaknesses) . " topics needing urgent attention. Check your recommendations.",
                'icon' => '⚠️',
                'link' => '/analytics',
            ]);
        }

        if ($snapshot->total_quizzes > 0 && $snapshot->total_quizzes % 5 === 0) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'achievement',
                'title' => '🎉 Quiz Milestone!',
                'message' => "You've completed {$snapshot->total_quizzes} quizzes! Great consistency.",
                'icon' => '🏆',
                'link' => '/analytics',
            ]);
        }
    }
}
