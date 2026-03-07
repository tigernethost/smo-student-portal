<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private array $providers = ['google', 'facebook', 'apple'];

    // GET /api/auth/redirect/{provider}
    // Returns the OAuth redirect URL (frontend opens it)
    public function redirect(string $provider)
    {
        if (!in_array($provider, $this->providers)) {
            return response()->json(['message' => 'Unsupported provider'], 422);
        }

        $url = Socialite::driver($provider)
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    // GET /api/auth/callback/{provider}
    // OAuth provider redirects here after login
    public function callback(Request $request, string $provider)
    {
        if (!in_array($provider, $this->providers)) {
            return $this->redirectWithError('Unsupported provider');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return $this->redirectWithError('Authentication failed. Please try again.');
        }

        $email = $socialUser->getEmail();
        if (!$email) {
            return $this->redirectWithError('Could not retrieve email from ' . ucfirst($provider) . '.');
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'              => $socialUser->getName() ?? $socialUser->getNickname() ?? explode('@', $email)[0],
                'password'          => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
                'role'              => 'student',
                'onboarding_done'   => false,
            ]
        );

        // Update avatar if available and not already set
        if (!$user->avatar_url && $socialUser->getAvatar()) {
            $user->update(['avatar_url' => $socialUser->getAvatar()]);
        }

        // Issue Sanctum token
        $token = $user->createToken('student-portal-' . $provider)->plainTextToken;

        // Redirect to frontend with token
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://portal.schoolmate-online.net'));
        $redirectPath = $user->onboarding_done ? '/dashboard' : '/onboarding';

        return redirect("{$frontendUrl}/auth/social-callback?token={$token}&redirect={$redirectPath}");
    }

    private function redirectWithError(string $message): \Illuminate\Http\RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'https://portal.schoolmate-online.net'));
        $encoded = urlencode($message);
        return redirect("{$frontendUrl}/login?error={$encoded}");
    }
}
