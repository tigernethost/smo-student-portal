<?php
namespace App\Http\Controllers;

use App\Models\ParentAccount;
use App\Models\ParentStudentLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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


    // GET /api/parent/auth/social/{provider}
    // Redirects parent to Google/Facebook OAuth
    public function socialRedirect(string $provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['error' => 'Unsupported provider.'], 400);
        }

        $appUrl = env('APP_URL', 'https://portal.schoolmate-online.net/api');
        $redirectUrl = \Laravel\Socialite\Facades\Socialite::driver($provider)
            ->stateless()
            ->with(['redirect_uri' => $appUrl . '/parent/auth/callback/' . $provider])
            ->redirect()
            ->getTargetUrl();

        return response()->json(['redirect_url' => $redirectUrl]);
    }

    // GET /api/parent/auth/callback/{provider}?code=...
    // Handles OAuth callback and returns parent token
    public function socialCallback(Request $request, string $provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['error' => 'Unsupported provider.'], 400);
        }

        try {
            $appUrl = env('APP_URL', 'https://portal.schoolmate-online.net/api');
            $socialUser = \Laravel\Socialite\Facades\Socialite::driver($provider)
                ->stateless()
                ->redirectUrl($appUrl . '/parent/auth/callback/' . $provider)
                ->user();
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');
            return redirect("{$frontendUrl}/parent/login?error=oauth_failed");
        }

        $email    = $socialUser->getEmail();
        $name     = $socialUser->getName() ?: $socialUser->getNickname() ?: 'Parent';
        $avatar   = $socialUser->getAvatar();
        $socialId = $socialUser->getId();

        // Find or create parent account
        $parent = ParentAccount::where('email', $email)->first();

        if (!$parent) {
            // New parent — create account (no link code required for social login)
            $parent = ParentAccount::create([
                'name'              => $name,
                'email'             => $email,
                'password'          => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
                'avatar'            => $avatar,
                $provider . '_id'   => $socialId,
            ]);
        } else {
            // Update social ID and avatar
            $parent->update([
                'avatar'          => $avatar ?? $parent->avatar,
                $provider . '_id' => $socialId,
            ]);
        }

        $token = $parent->createToken('parent-token')->plainTextToken;
        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');

        // Redirect to frontend with token
        return redirect("{$frontendUrl}/parent/auth/callback?token={$token}&provider={$provider}");
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
