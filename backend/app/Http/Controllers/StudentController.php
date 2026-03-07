<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'student_id' => $user->student_id,
            'grade' => $user->grade ?? 8,
            'section' => $user->section ?? 'Sampaguita',
            'school_year' => '2025-2026',
            'quarter' => 3,
        ]);
    }

    public function dashboard(Request $request)
    {
        // Will be populated from SchoolMATE DB
        return response()->json([
            'average' => 87.4,
            'attendance_rate' => 94.2,
            'rank' => 3,
            'total_students' => 42,
            'quarter' => 3,
            'school_year' => '2025-2026',
            'subjects_count' => 8,
            'improving_subjects' => 4,
            'at_risk_subjects' => 1,
        ]);
    }

    public function attendance(Request $request)
    {
        return response()->json([
            'overall' => ['present' => 18, 'late' => 1, 'absent' => 1, 'total' => 20, 'rate' => 94.2],
            'by_subject' => [],
        ]);
    }

    public function goals(Request $request)
    {
        $user = $request->user();
        $goals = \DB::table('student_goals')->where('user_id', $user->id)->get();
        return response()->json($goals);
    }

    public function storeGoal(Request $request)
    {
        $request->validate([
            'subject' => 'required|string',
            'type' => 'required|in:grade,attendance,mastery',
            'target' => 'required|numeric',
            'deadline' => 'nullable|string',
        ]);

        $id = \DB::table('student_goals')->insertGetId([
            'user_id' => $request->user()->id,
            'subject' => $request->subject,
            'type' => $request->type,
            'target' => $request->target,
            'current' => 0,
            'deadline' => $request->deadline,
            'status' => 'on-track',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Goal created'], 201);
    }

    public function updateGoal(Request $request, $id)
    {
        \DB::table('student_goals')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(array_merge($request->only(['subject','type','target','deadline','status']), ['updated_at' => now()]));
        return response()->json(['message' => 'Goal updated']);
    }

    public function deleteGoal(Request $request, $id)
    {
        \DB::table('student_goals')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();
        return response()->json(['message' => 'Goal deleted']);
    }

    public function learningPath(Request $request)
    {
        return response()->json([
            'subjects' => [],
            'overall_mastery' => 76.3,
            'recommended_next' => 'Systems of Equations',
        ]);
    }

    public function analytics(Request $request)
    {
        return response()->json([
            'overall_average' => 87.4,
            'by_quarter' => [
                ['quarter' => 1, 'average' => 87.0],
                ['quarter' => 2, 'average' => 88.6],
                ['quarter' => 3, 'average' => 90.1],
            ],
        ]);
    }

    public function recommendations(Request $request)
    {
        return response()->json([
            ['subject' => 'Araling Panlipunan', 'topic' => 'Southeast Asian History', 'priority' => 'high', 'reason' => 'Score dropped 5 points this quarter'],
            ['subject' => 'Science', 'topic' => 'Chemical Equations', 'priority' => 'medium', 'reason' => 'Nearing mastery threshold'],
        ]);
    }

    public function notifications(Request $request)
    {
        return response()->json([
            ['id' => 1, 'type' => 'alert', 'message' => 'AP score dropped — review Southeast Asian History', 'read' => false, 'created_at' => now()->subHours(2)],
            ['id' => 2, 'type' => 'achievement', 'message' => 'You mastered Quadratic Equations! 🎉', 'read' => false, 'created_at' => now()->subDay()],
        ]);
    }
}
