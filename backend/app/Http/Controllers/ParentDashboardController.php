<?php
namespace App\Http\Controllers;

use App\Models\ParentAccount;
use App\Models\ParentNotification;
use App\Models\StudentTopicMastery;
use App\Models\QuizSession;
use App\Models\StudentUpload;
use App\Models\User;
use Illuminate\Http\Request;

class ParentDashboardController extends Controller
{
    // Middleware helper — verify parent owns student
    private function getStudent(Request $request, int $studentId): User|null
    {
        $parent = $request->user();
        return $parent->students()->where('users.id', $studentId)->first();
    }

    // GET /api/parent/children
    public function children(Request $request)
    {
        $parent = $request->user();
        $children = $parent->students()->get()->map(fn($s) => $this->childSummary($s));
        return response()->json(['children' => $children]);
    }

    // GET /api/parent/children/{id}/dashboard
    public function dashboard(Request $request, int $id)
    {
        $student = $this->getStudent($request, $id);
        if (!$student) return response()->json(['error' => 'Unauthorized'], 403);

        $link = $request->user()->links()->where('student_id', $id)->first();

        // Recent quiz sessions (last 5)
        $recentQuizzes = QuizSession::where('user_id', $id)
            ->where('status', 'completed')
            ->with('subject', 'topic')
            ->latest()->limit(5)->get()
            ->map(fn($q) => [
                'subject'    => $q->subject?->name,
                'topic'      => $q->topic?->name,
                'score'      => $q->correct,
                'total'      => $q->total_questions,
                'pct'        => $q->total_questions > 0 ? round(($q->correct / $q->total_questions) * 100) : 0,
                'date'       => $q->created_at->diffForHumans(),
            ]);

        // Subject mastery summary
        $masteries = StudentTopicMastery::where('user_id', $id)
            ->with('subject')
            ->get()
            ->groupBy('subject_id')
            ->map(fn($group) => [
                'subject'       => $group->first()->subject?->name,
                'icon'          => $group->first()->subject?->icon,
                'color'         => $group->first()->subject?->color,
                'mastered'      => $group->where('mastery_score', '>=', 75)->count(),
                'total'         => $group->count(),
                'avg_mastery'   => round($group->avg('mastery_score')),
            ])->values();

        // Stats
        $totalQuizzes   = QuizSession::where('user_id', $id)->where('status', 'completed')->count();
        $avgScore       = QuizSession::where('user_id', $id)->where('status', 'completed')->where('total_questions', '>', 0)->get()->avg(fn($q) => $q->total_questions > 0 ? ($q->correct / $q->total_questions) * 100 : 0);
        $atRiskCount    = StudentTopicMastery::where('user_id', $id)->where('attempts', '>', 0)->where('mastery_score', '<', 40)->count();
        $masteredCount  = StudentTopicMastery::where('user_id', $id)->where('mastery_score', '>=', 75)->count();

        return response()->json([
            'student'      => $this->childSummary($student),
            'relationship' => $link?->relationship ?? 'Guardian',
            'stats' => [
                'total_quizzes'   => $totalQuizzes,
                'avg_score'       => round($avgScore ?? 0),
                'mastered_topics' => $masteredCount,
                'at_risk_topics'  => $atRiskCount,
            ],
            'recent_quizzes'  => $recentQuizzes,
            'subject_mastery' => $masteries,
        ]);
    }

    // GET /api/parent/children/{id}/performance
    public function performance(Request $request, int $id)
    {
        $student = $this->getStudent($request, $id);
        if (!$student) return response()->json(['error' => 'Unauthorized'], 403);

        $masteries = StudentTopicMastery::where('user_id', $id)
            ->with('subject', 'topic')
            ->get()
            ->groupBy('subject_id');

        $subjects = $masteries->map(function ($topics, $subjectId) {
            $subject = $topics->first()->subject;
            $byStatus = [
                'mastered'    => $topics->where('mastery_score', '>=', 75)->count(),
                'in_progress' => $topics->whereBetween('mastery_score', [40, 74.99])->count(),
                'at_risk'     => $topics->where('attempts', '>', 0)->where('mastery_score', '<', 40)->count(),
                'not_started' => $topics->where('attempts', 0)->count(),
            ];

            return [
                'id'          => $subjectId,
                'name'        => $subject?->name,
                'icon'        => $subject?->icon,
                'color'       => $subject?->color,
                'avg_mastery' => round($topics->avg('mastery_score')),
                'total'       => $topics->count(),
                'status'      => $byStatus,
                'topics'      => $topics->map(fn($t) => [
                    'name'         => $t->topic?->name,
                    'quarter'      => $t->topic?->quarter,
                    'mastery'      => round($t->mastery_score),
                    'attempts'     => $t->attempts,
                ])->sortBy('quarter')->values(),
            ];
        })->values();

        // Quiz history for trend
        $quizHistory = QuizSession::where('user_id', $id)
            ->where('status', 'completed')
            ->where('total_questions', '>', 0)
            ->latest()->limit(20)->get()
            ->map(fn($q) => [
                'date'    => $q->created_at->format('M d'),
                'subject' => $q->subject?->name,
                'pct'     => round(($q->correct / $q->total_questions) * 100),
            ])->reverse()->values();

        return response()->json([
            'student'      => ['id' => $student->id, 'name' => $student->name],
            'subjects'     => $subjects,
            'quiz_history' => $quizHistory,
        ]);
    }

    // GET /api/parent/notifications
    public function notifications(Request $request)
    {
        $parent = $request->user();
        $notes = $parent->notifications()->with('student')->limit(50)->get()->map(fn($n) => [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'body'       => $n->body,
            'student'    => $n->student?->name,
            'is_read'    => $n->is_read,
            'created_at' => $n->created_at->diffForHumans(),
        ]);

        return response()->json([
            'notifications' => $notes,
            'unread_count'  => $notes->where('is_read', false)->count(),
        ]);
    }

    // POST /api/parent/notifications/read-all
    public function readAllNotifications(Request $request)
    {
        $request->user()->notifications()->update(['is_read' => true]);
        return response()->json(['message' => 'All notifications marked as read']);
    }

    private function childSummary(User $student): array
    {
        $totalTopics   = StudentTopicMastery::where('user_id', $student->id)->count();
        $masteredCount = StudentTopicMastery::where('user_id', $student->id)->where('mastery_score', '>=', 75)->count();
        $atRisk        = StudentTopicMastery::where('user_id', $student->id)->where('attempts', '>', 0)->where('mastery_score', '<', 40)->count();
        $quizCount     = QuizSession::where('user_id', $student->id)->where('status', 'completed')->count();

        return [
            'id'            => $student->id,
            'name'          => $student->name,
            'grade_level'   => $student->grade_level,
            'strand'        => $student->strand,
            'school_name'   => $student->school_name,
            'plan'          => $student->plan,
            'total_topics'  => $totalTopics,
            'mastered'      => $masteredCount,
            'mastery_pct'   => $totalTopics > 0 ? round(($masteredCount / $totalTopics) * 100) : 0,
            'at_risk'       => $atRisk,
            'quiz_count'    => $quizCount,
        ];
    }
}
