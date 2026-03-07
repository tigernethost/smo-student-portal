<?php
namespace App\Http\Controllers;
use App\Models\{AnalyticsSnapshot, Notification, Recommendation, StudentGoal, StudentSubject, StudentTopicMastery, Subject};
use App\Services\AnalyticsService;
use App\Services\AIQuotaService;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(
        private AnalyticsService $analytics,
        private AIQuotaService $quota
    ) {}

    public function profile(Request $request)
    {
        $user = $request->user();
        $snapshot = AnalyticsSnapshot::where('user_id', $user->id)->first();
        return response()->json([
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'grade_level' => $user->grade_level, 'strand' => $user->strand,
            'school_name' => $user->school_name, 'onboarding_done' => (bool)$user->onboarding_done,
            'subjects_enrolled' => StudentSubject::where('user_id',$user->id)->where('is_active',true)->count(),
            'overall_score' => $snapshot?->overall_score ?? 0,
            'risk_level' => $snapshot?->risk_level ?? 'low',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'               => 'nullable|string|max:255',
            'grade_level'        => 'nullable|integer|min:7|max:12',
            'strand'             => 'nullable|string',
            'school_name'        => 'nullable|string|max:255',
            'learning_goal'      => 'nullable|string|max:255',
            'learning_challenge' => 'nullable|string|max:255',
            'learning_style'      => 'nullable|string|max:100',
            'subject_ids'        => 'nullable|array',
            'subject_ids.*'      => 'exists:subjects,id',
            'avatar'             => 'nullable|image|max:4096',
            'onboarding_done'    => 'nullable|in:true,false,1,0',
        ]);

        $user = $request->user();
        $fields = array_filter(
            $request->only(['name','grade_level','strand','school_name','learning_goal','learning_challenge']),
            fn($v) => $v !== null
        );

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $fields['avatar_url'] = '/storage/' . $path;
        }

        if (!empty($fields)) $user->update($fields);

        if ($request->has('subject_ids')) {
            StudentSubject::where('user_id',$user->id)->update(['is_active'=>false]);
            foreach ($request->subject_ids as $sid) {
                StudentSubject::updateOrCreate(
                    ['user_id'=>$user->id,'subject_id'=>$sid,'school_year'=>'2025-2026'],
                    ['is_active'=>true,'quarter'=>3]
                );
                foreach (\App\Models\Topic::where('subject_id',$sid)->get() as $topic) {
                    StudentTopicMastery::firstOrCreate(
                        ['user_id'=>$user->id,'topic_id'=>$topic->id],
                        ['mastery_score'=>0,'status'=>'available']
                    );
                }
            }
        }

        if (in_array($request->input('onboarding_done'), [true, 1, 'true', '1', 'on', 'yes'], true) || $request->boolean('onboarding_done')) {
            $user->update(['onboarding_done' => true]);
        }

        return response()->json(['message'=>'Profile updated','user'=>$user->fresh()]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $snapshot = AnalyticsSnapshot::where('user_id',$user->id)->first();
        $subjectScores = $snapshot?->subject_scores ?? [];
        $subjects = StudentSubject::with('subject')->where('user_id',$user->id)->where('is_active',true)->get()->map(function($ss) use($subjectScores) {
            $s = $ss->subject;
            return ['id'=>$s->id,'name'=>$s->name,'icon'=>$s->icon,'color'=>$s->color,'score'=>$subjectScores[$s->id] ?? null];
        });
        $recentQuizzes = \App\Models\QuizSession::with(['subject','topic'])->where('user_id',$user->id)->where('status','completed')->orderByDesc('created_at')->take(5)->get()->map(fn($q)=>['id'=>$q->id,'subject'=>$q->subject?->name,'topic'=>$q->topic?->name,'score_pct'=>$q->score_pct,'date'=>$q->created_at->diffForHumans()]);
        $recentUploads = \App\Models\StudentUpload::with('subject')->where('user_id',$user->id)->orderByDesc('created_at')->take(3)->get()->map(fn($u)=>['id'=>$u->id,'type'=>$u->type,'subject'=>$u->subject?->name??$u->extracted_subject,'status'=>$u->status,'score'=>$u->extracted_score,'total'=>$u->extracted_total,'date'=>$u->created_at->diffForHumans()]);
        return response()->json([
            'overall_score' => $snapshot?->overall_score ?? 0,
            'risk_level' => $snapshot?->risk_level ?? 'low',
            'total_quizzes' => $snapshot?->total_quizzes ?? 0,
            'total_uploads' => $snapshot?->total_uploads ?? 0,
            'subjects' => $subjects,
            'strengths' => $snapshot?->strengths ?? [],
            'weaknesses' => $snapshot?->weaknesses ?? [],
            'recommendations' => $snapshot?->recommended_topics ?? [],
            'ai_summary' => $snapshot?->ai_summary,
            'recent_quizzes' => $recentQuizzes,
            'recent_uploads' => $recentUploads,
            'unread_notifications' => Notification::where('user_id',$user->id)->where('is_read',false)->count(),
            'onboarding_done' => (bool)$user->onboarding_done,
            'quota' => $this->quota->status($user),
        ]);
    }

    public function analytics(Request $request)
    {
        $user = $request->user();
        $snapshot = AnalyticsSnapshot::where('user_id',$user->id)->first();
        if (!$snapshot) return response()->json(['message'=>'No analytics yet. Take quizzes or upload documents first.']);
        $subjects = StudentSubject::with('subject')->where('user_id',$user->id)->where('is_active',true)->get()->map(function($ss) use($user,$snapshot) {
            $s = $ss->subject;
            $topicMasteries = StudentTopicMastery::with('topic')->where('user_id',$user->id)->whereHas('topic',fn($q)=>$q->where('subject_id',$s->id))->get();
            return ['id'=>$s->id,'name'=>$s->name,'icon'=>$s->icon,'color'=>$s->color,'score'=>($snapshot->subject_scores??[])[$s->id]??null,'mastered_topics'=>$topicMasteries->where('status','mastered')->count(),'total_topics'=>$topicMasteries->count(),'at_risk_topics'=>$topicMasteries->where('status','at-risk')->count()];
        });
        return response()->json(['overall_score'=>$snapshot->overall_score,'risk_level'=>$snapshot->risk_level,'total_quizzes'=>$snapshot->total_quizzes,'total_uploads'=>$snapshot->total_uploads,'ai_summary'=>$snapshot->ai_summary,'strengths'=>$snapshot->strengths,'weaknesses'=>$snapshot->weaknesses,'at_risk_topics'=>$snapshot->at_risk_topics,'subject_details'=>$subjects,'last_updated'=>$snapshot->updated_at]);
    }

    public function learningPath(Request $request)
    {
        $user = $request->user();
        $enrolledIds = StudentSubject::where('user_id',$user->id)->where('is_active',true)->pluck('subject_id');
        $subjects = Subject::with('topics')->whereIn('id',$enrolledIds)->get()->map(function($subject) use($user) {
            $topics = $subject->topics->map(function($topic) use($user) {
                $m = StudentTopicMastery::where('user_id',$user->id)->where('topic_id',$topic->id)->first();
                return ['id'=>$topic->id,'name'=>$topic->name,'quarter'=>$topic->quarter,'mastery_score'=>$m?->mastery_score??0,'status'=>$m?->status??'available','attempts'=>$m?->attempts??0];
            });
            $mastered = $topics->where('status','mastered')->count();
            return ['id'=>$subject->id,'name'=>$subject->name,'icon'=>$subject->icon,'color'=>$subject->color,'mastery_pct'=>$topics->count()>0?round(($mastered/$topics->count())*100):0,'mastered_topics'=>$mastered,'total_topics'=>$topics->count(),'topics'=>$topics];
        });
        return response()->json(['subjects'=>$subjects]);
    }

    public function recommendations(Request $request)
    {
        $recs = Recommendation::with(['subject','topic'])->where('user_id',$request->user()->id)->where('is_dismissed',false)->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")->take(8)->get();
        return response()->json($recs);
    }

    public function dismissRecommendation(Request $request, $id)
    {
        Recommendation::where('user_id',$request->user()->id)->findOrFail($id)->update(['is_dismissed'=>true]);
        return response()->json(['message'=>'Dismissed']);
    }

    public function notifications(Request $request)
    {
        return response()->json(Notification::where('user_id',$request->user()->id)->orderByDesc('created_at')->paginate(20));
    }

    public function markNotificationRead(Request $request, $id)
    {
        Notification::where('user_id',$request->user()->id)->findOrFail($id)->update(['is_read'=>true]);
        return response()->json(['message'=>'Read']);
    }

    public function markAllNotificationsRead(Request $request)
    {
        Notification::where('user_id',$request->user()->id)->where('is_read',false)->update(['is_read'=>true]);
        return response()->json(['message'=>'All read']);
    }

    public function goals(Request $request) { return response()->json(StudentGoal::with('subject')->where('user_id',$request->user()->id)->get()); }

    public function storeGoal(Request $request)
    {
        $request->validate(['subject_name'=>'required|string','subject_id'=>'nullable|exists:subjects,id','type'=>'required|in:grade,mastery,quiz_streak','target'=>'required|numeric|min:1|max:100','deadline'=>'nullable|string']);
        $goal = StudentGoal::create(array_merge($request->validated(),['user_id'=>$request->user()->id]));
        return response()->json($goal,201);
    }

    public function updateGoal(Request $request, $id)
    {
        $goal = StudentGoal::where('user_id',$request->user()->id)->findOrFail($id);
        $goal->update($request->only(['subject_name','target','deadline','status','current_value']));
        return response()->json($goal);
    }

    public function deleteGoal(Request $request, $id)
    {
        StudentGoal::where('user_id',$request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message'=>'Deleted']);
    }

    public function availableSubjects() { return response()->json(Subject::where('is_active',true)->orderBy('name')->get()); }

    public function refreshAnalytics(Request $request)
    {
        $snapshot = $this->analytics->generateSnapshot($request->user()->id);
        return response()->json(['message'=>'Refreshed','snapshot'=>$snapshot]);
    }
}
