<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AIQuotaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private AIQuotaService $quota) {}

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('student-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::create([
            'name'             => $request->name,
            'email'            => $request->email,
            'password'         => Hash::make($request->password),
            'plan'             => 'free',
            'ai_quota_limit'   => 10,
            'ai_quota_used'    => 0,
            'ai_quota_reset_at'=> now()->addMonth(),
        ]);

        $token = $user->createToken('student-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            ...$user->toArray(),
            'quota' => $this->quota->status($user),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'grade_level'    => $user->grade_level,
            'strand'         => $user->strand,
            'school_name'    => $user->school_name,
            'onboarding_done'=> (bool)$user->onboarding_done,
            'plan'           => $user->plan ?? 'free',
            'quota'          => $this->quota->status($user),
        ];
    }
}
