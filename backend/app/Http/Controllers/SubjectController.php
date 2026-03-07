<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        // Will query SchoolMATE enrolled_subjects table
        return response()->json([
            'subjects' => [],
            'count' => 0,
        ]);
    }

    public function show(Request $request, $id)
    {
        return response()->json([
            'id' => $id,
            'name' => 'Mathematics',
            'teacher' => 'Mr. Santos',
            'average' => 92,
        ]);
    }

    public function grades(Request $request, $id)
    {
        return response()->json([
            'subject_id' => $id,
            'components' => [
                ['name' => 'Written Work', 'weight' => 25, 'score' => 93],
                ['name' => 'Performance Task', 'weight' => 50, 'score' => 91],
                ['name' => 'Quarterly Assessment', 'weight' => 25, 'score' => 95],
            ],
            'quarters' => [
                ['quarter' => 1, 'score' => 90],
                ['quarter' => 2, 'score' => 91],
                ['quarter' => 3, 'score' => 95],
            ],
        ]);
    }

    public function topics(Request $request, $id)
    {
        return response()->json([
            'subject_id' => $id,
            'topics' => [],
        ]);
    }

    public function attendance(Request $request, $id)
    {
        return response()->json([
            'subject_id' => $id,
            'present' => 18,
            'late' => 1,
            'absent' => 1,
            'total' => 20,
            'rate' => 90.0,
        ]);
    }
}
