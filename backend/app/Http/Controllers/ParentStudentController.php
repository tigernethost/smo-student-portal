<?php
namespace App\Http\Controllers;

use App\Models\ParentAccount;
use App\Models\ParentStudentLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ParentStudentController extends Controller
{
    // Subscription tier limits
    const STUDENT_LIMITS = [
        'free'    => 1,
        'basic'   => 3,
        'pro'     => PHP_INT_MAX,
        'premium' => PHP_INT_MAX, // legacy
    ];

    // POST /api/parent/students/create
    // Parent creates a student account and gets an invite link
    public function createStudent(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:100',
            'grade_level'  => 'required|string|max:50',
            'school_name'  => 'nullable|string|max:150',
            'relationship' => 'nullable|string|max:50',
        ]);

        $parent = $request->user();

        // Check subscription limit
        $currentCount = $parent->students()->count();
        $limit = self::STUDENT_LIMITS[$parent->subscription_tier] ?? 1;

        if ($currentCount >= $limit) {
            $tierName = ucfirst($parent->subscription_tier);
            return response()->json([
                'error' => "Your {$tierName} plan allows up to {$limit} student(s). Please upgrade to add more.",
                'limit_reached' => true,
                'current_count' => $currentCount,
                'limit' => $limit,
            ], 403);
        }

        // Generate a unique invite token (expires in 7 days)
        $inviteToken = Str::random(32);
        $expiresAt   = now()->addDays(7);

        // Create the student account with a random temporary password
        // (they'll set their own password when accepting the invite)
        $tempPassword = Str::random(16);
        $linkCode     = strtoupper(Str::random(8));

        $student = User::create([
            'name'              => $request->name,
            'email'             => 'pending_' . $inviteToken . '@invite.schoolmate',
            'password'          => Hash::make($tempPassword),
            'grade_level'       => $request->grade_level,
            'school_name'       => $request->school_name ?? '',
            'parent_link_code'  => $linkCode,
            'created_by_parent' => true,
            'created_by_parent_id' => $parent->id,
            'onboarding_completed' => false,
        ]);

        // Link parent to student with invite token
        ParentStudentLink::create([
            'parent_id'       => $parent->id,
            'student_id'      => $student->id,
            'relationship'    => $request->relationship ?? 'Guardian',
            'link_code'       => $linkCode,
            'invite_token'    => $inviteToken,
            'invite_expires_at' => $expiresAt,
            'invite_accepted' => false,
            'is_active'       => true,
        ]);

        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');
        $inviteLink  = "{$frontendUrl}/accept-invite/{$inviteToken}";

        return response()->json([
            'message'     => 'Student account created successfully!',
            'invite_link' => $inviteLink,
            'invite_token' => $inviteToken,
            'expires_at'  => $expiresAt->toISOString(),
            'student'     => [
                'id'          => $student->id,
                'name'        => $student->name,
                'grade_level' => $student->grade_level,
                'school_name' => $student->school_name,
            ],
        ], 201);
    }

    // GET /api/parent/students
    // List all students with their invite status
    public function listStudents(Request $request)
    {
        $parent = $request->user();
        $limit  = self::STUDENT_LIMITS[$parent->subscription_tier] ?? 1;

        $links = ParentStudentLink::where('parent_id', $parent->id)
            ->where('is_active', true)
            ->with('student')
            ->get();

        $students = $links->map(function ($link) {
            $s = $link->student;
            return [
                'id'              => $s->id,
                'name'            => $s->name,
                'grade_level'     => $s->grade_level,
                'school_name'     => $s->school_name,
                'relationship'    => $link->relationship,
                'created_by_parent' => $s->created_by_parent ?? false,
                'invite_accepted' => $link->invite_accepted,
                'invite_token'    => $link->invite_accepted ? null : $link->invite_token,
                'invite_expires_at' => $link->invite_expires_at,
                'invite_link'     => !$link->invite_accepted && $link->invite_token
                    ? env('FRONTEND_URL', 'https://portal.schoolmate-online.net') . '/accept-invite/' . $link->invite_token
                    : null,
            ];
        });

        return response()->json([
            'students'      => $students,
            'count'         => $students->count(),
            'limit'         => $limit === PHP_INT_MAX ? null : $limit,
            'can_add_more'  => $students->count() < $limit,
            'subscription_tier' => $parent->subscription_tier,
        ]);
    }

    // GET /api/invite/{token}  (public — no auth)
    // Validate an invite token and return student info
    public function getInvite($token)
    {
        $link = ParentStudentLink::where('invite_token', $token)
            ->with(['student', 'parent'])
            ->first();

        if (!$link) {
            return response()->json(['error' => 'Invalid invite link.'], 404);
        }

        if ($link->invite_accepted) {
            return response()->json(['error' => 'This invite has already been accepted.', 'already_accepted' => true], 410);
        }

        if ($link->invite_expires_at && now()->isAfter($link->invite_expires_at)) {
            return response()->json(['error' => 'This invite link has expired. Please ask your parent to resend it.', 'expired' => true], 410);
        }

        return response()->json([
            'valid'        => true,
            'student_name' => $link->student->name,
            'grade_level'  => $link->student->grade_level,
            'school_name'  => $link->student->school_name,
            'parent_name'  => $link->parent->name,
            'relationship' => $link->relationship,
        ]);
    }

    // POST /api/invite/{token}/accept  (public — no auth)
    // Student accepts invite, sets their email + password
    public function acceptInvite(Request $request, $token)
    {
        $request->validate([
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $link = ParentStudentLink::where('invite_token', $token)
            ->with('student')
            ->first();

        if (!$link) {
            return response()->json(['error' => 'Invalid invite link.'], 404);
        }

        if ($link->invite_accepted) {
            return response()->json(['error' => 'This invite has already been accepted.'], 410);
        }

        if ($link->invite_expires_at && now()->isAfter($link->invite_expires_at)) {
            return response()->json(['error' => 'This invite link has expired.'], 410);
        }

        // Update the student account with real email + password
        $student = $link->student;
        $student->update([
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Mark invite as accepted
        $link->update(['invite_accepted' => true]);

        // Log the student in
        $authToken = $student->createToken('student-token')->plainTextToken;

        return response()->json([
            'message'  => 'Account activated successfully! Welcome to SchoolMATE.',
            'token'    => $authToken,
            'redirect' => $student->onboarding_completed ? '/dashboard' : '/onboarding',
            'user'     => [
                'id'         => $student->id,
                'name'       => $student->name,
                'email'      => $student->email,
                'grade_level'=> $student->grade_level,
            ],
        ]);
    }

    // POST /api/parent/students/{id}/resend-invite
    public function resendInvite(Request $request, $studentId)
    {
        $parent = $request->user();

        $link = ParentStudentLink::where('parent_id', $parent->id)
            ->where('student_id', $studentId)
            ->where('invite_accepted', false)
            ->first();

        if (!$link) {
            return response()->json(['error' => 'No pending invite found.'], 404);
        }

        // Generate fresh token + extend expiry
        $newToken = Str::random(32);
        $link->update([
            'invite_token'      => $newToken,
            'invite_expires_at' => now()->addDays(7),
        ]);

        // Update student's temp email to match new token
        $link->student->update([
            'email' => 'pending_' . $newToken . '@invite.schoolmate',
        ]);

        $inviteLink = env('FRONTEND_URL', 'https://portal.schoolmate-online.net') . '/accept-invite/' . $newToken;

        return response()->json([
            'message'     => 'New invite link generated.',
            'invite_link' => $inviteLink,
            'expires_at'  => now()->addDays(7)->toISOString(),
        ]);
    }
}
