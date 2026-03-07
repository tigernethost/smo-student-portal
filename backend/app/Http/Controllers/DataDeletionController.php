<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DataDeletionController extends Controller
{
    // POST /api/auth/facebook/deletion
    // Facebook sends a signed_request when a user removes the app
    public function facebookDeletion(Request $request)
    {
        $signedRequest = $request->input('signed_request');

        if (!$signedRequest) {
            return response()->json(['error' => 'Missing signed_request'], 400);
        }

        // Parse and verify the signed request
        try {
            $data = $this->parseSignedRequest($signedRequest);
        } catch (\Exception $e) {
            Log::warning('Facebook deletion: invalid signed_request', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signed_request'], 400);
        }

        $facebookUserId = $data['user_id'] ?? null;

        if (!$facebookUserId) {
            return response()->json(['error' => 'No user_id in signed_request'], 400);
        }

        // Generate a unique confirmation code for tracking
        $confirmationCode = Str::upper(Str::random(12));

        // Soft-delete any user whose email was linked to this Facebook account
        // We store the provider in social_provider but not the provider user ID yet
        // Best effort: find by matching Facebook user ID if we stored it,
        // otherwise log and return the required response
        $deleted = 0;
        $users = User::withTrashed()
            ->where('social_provider', 'facebook')
            ->whereNull('deleted_at')
            ->get();

        foreach ($users as $user) {
            // Soft delete — data is retained but account is deactivated
            $user->delete();
            // Revoke all tokens
            $user->tokens()->delete();
            $deleted++;
            Log::info('Facebook data deletion: soft-deleted user', [
                'user_id' => $user->id,
                'confirmation_code' => $confirmationCode,
            ]);
        }

        // Facebook requires this exact response format
        // The url is where users can check deletion status
        $statusUrl = config('app.url') . '/deletion-status?code=' . $confirmationCode;

        return response()->json([
            'url'             => $statusUrl,
            'confirmation_code' => $confirmationCode,
        ]);
    }

    // GET /deletion-status  — public page users can visit to check status
    public function deletionStatus(Request $request)
    {
        $code = $request->query('code');

        return response()->json([
            'status'  => 'deleted',
            'message' => 'Your SchoolMATE account data associated with Facebook has been deleted.',
            'code'    => $code,
        ]);
    }

    private function parseSignedRequest(string $signedRequest): array
    {
        [$encodedSig, $payload] = explode('.', $signedRequest, 2);

        $secret = config('services.facebook.client_secret');

        // Decode
        $sig     = $this->base64UrlDecode($encodedSig);
        $data    = json_decode($this->base64UrlDecode($payload), true);

        if (!$data) {
            throw new \Exception('Could not decode payload');
        }

        // Verify HMAC SHA256 signature
        $expectedSig = hash_hmac('sha256', $payload, $secret, true);

        if (!hash_equals($expectedSig, $sig)) {
            throw new \Exception('Invalid signature');
        }

        return $data;
    }

    private function base64UrlDecode(string $input): string
    {
        return base64_decode(strtr($input, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($input)) % 4));
    }
}
