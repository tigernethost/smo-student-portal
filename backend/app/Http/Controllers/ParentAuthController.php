<?php
namespace App\Http\Controllers;

use App\Models\ParentAccount;
use App\Models\ParentStudentLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ParentAuthController extends Controller
{
    // POST /api/parent/auth/register
    public function register(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:100',
            'email'     => 'required|email|unique:parent_accounts,email',
            'password'  => 'required|string|min:8',
            'link_code' => 'required|string', // student's parent_link_code
            'relationship' => 'nullable|string|max:50',
        ]);

        // Find the student by link code
        $student = User::where('parent_link_code', strtoupper($request->link_code))->first();
        if (!$student) {
            return response()->json(['error' => 'Invalid link code. Please ask your child for their Parent Link Code.'], 404);
        }

        $parent = ParentAccount::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
        ]);

        // Link parent to student
        ParentStudentLink::create([
            'parent_id'    => $parent->id,
            'student_id'   => $student->id,
            'relationship' => $request->relationship ?? 'Guardian',
            'link_code'    => $request->link_code,
            'is_active'    => true,
        ]);

        $token = $parent->createToken('parent-token')->plainTextToken;

        return response()->json([
            'token'  => $token,
            'parent' => $this->formatParent($parent),
            'linked_student' => [
                'id'          => $student->id,
                'name'        => $student->name,
                'grade_level' => $student->grade_level,
                'school_name' => $student->school_name,
            ],
        ], 201);
    }

    // POST /api/parent/auth/login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $parent = ParentAccount::where('email', $request->email)->first();
        if (!$parent || !Hash::check($request->password, $parent->password)) {
            return response()->json(['error' => 'Invalid email or password.'], 401);
        }

        $token = $parent->createToken('parent-token')->plainTextToken;

        return response()->json([
            'token'  => $token,
            'parent' => $this->formatParent($parent),
        ]);
    }

    // POST /api/parent/auth/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // GET /api/parent/auth/me
    public function me(Request $request)
    {
        return response()->json(['parent' => $this->formatParent($request->user())]);
    }

    // POST /api/parent/auth/link  (add another child)
    public function linkChild(Request $request)
    {
        $request->validate([
            'link_code'    => 'required|string',
            'relationship' => 'nullable|string|max:50',
        ]);

        $student = User::where('parent_link_code', strtoupper($request->link_code))->first();
        if (!$student) {
            return response()->json(['error' => 'Invalid link code.'], 404);
        }

        $parent = $request->user();

        $existing = ParentStudentLink::where('parent_id', $parent->id)
            ->where('student_id', $student->id)->first();
        if ($existing) {
            $existing->update(['is_active' => true]);
        } else {
            ParentStudentLink::create([
                'parent_id'    => $parent->id,
                'student_id'   => $student->id,
                'relationship' => $request->relationship ?? 'Guardian',
                'link_code'    => $request->link_code,
                'is_active'    => true,
            ]);
        }

        return response()->json([
            'message' => "Linked to {$student->name}",
            'student' => ['id' => $student->id, 'name' => $student->name, 'grade_level' => $student->grade_level],
        ]);
    }

    private function formatParent(ParentAccount $parent): array
    {
        $students = $parent->students()->get()->map(fn($s) => [
            'id'          => $s->id,
            'name'        => $s->name,
            'grade_level' => $s->grade_level,
            'strand'      => $s->strand,
            'school_name' => $s->school_name,
            'relationship'=> $s->pivot->relationship,
        ]);

        return [
            'id'                => $parent->id,
            'name'              => $parent->name,
            'email'             => $parent->email,
            'phone'             => $parent->phone,
            'subscription_tier' => $parent->subscription_tier,
            'children'          => $students,
            'unread_notifications' => $parent->notifications()->where('is_read', false)->count(),
        ];
    }
}
