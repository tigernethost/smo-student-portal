<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AIQuotaService
{
    const PLAN_LIMITS = [
        'free'       => 10,
        'basic'      => 75,
        'pro'        => 999,   // effectively unlimited
        'b2b_basic'  => 0,     // no AI access
        'b2b_ai'     => 100,
    ];

    const PLAN_PRICES_PHP = [
        'basic'      => 99,
        'pro'        => 199,
        'b2b_basic'  => null,  // invoice
        'b2b_ai'     => null,  // invoice
    ];

    // Cost per 1M tokens in USD × PHP rate
    const USD_PHP       = 57;
    const INPUT_COST_M  = 3.00;
    const OUTPUT_COST_M = 15.00;

    /**
     * Check if user can perform an AI action.
     * Returns ['allowed' => bool, 'remaining' => int, 'plan' => string, 'message' => string]
     */
    public function check(User $user): array
    {
        $this->maybeResetMonthly($user);

        $plan  = $user->plan ?? 'free';
        $limit = self::PLAN_LIMITS[$plan] ?? 10;
        $used  = $user->ai_quota_used ?? 0;

        if ($plan === 'b2b_basic') {
            return ['allowed' => false, 'remaining' => 0, 'plan' => $plan,
                    'message' => 'AI features require the B2B AI plan. Contact your school admin.'];
        }

        if ($used >= $limit) {
            return ['allowed' => false, 'remaining' => 0, 'plan' => $plan,
                    'message' => "You've used all {$limit} AI actions for this month. Upgrade to continue."];
        }

        return ['allowed' => true, 'remaining' => $limit - $used, 'plan' => $plan, 'message' => 'ok'];
    }

    /**
     * Consume one AI action quota. Call AFTER the AI action succeeds.
     */
    public function consume(User $user, string $actionType, int $tokensIn = 0, int $tokensOut = 0): void
    {
        $costPhp = $this->calculateCost($tokensIn, $tokensOut);

        $user->increment('ai_quota_used');

        DB::table('ai_usage_logs')->insert([
            'user_id'     => $user->id,
            'action_type' => $actionType,
            'tokens_in'   => $tokensIn,
            'tokens_out'  => $tokensOut,
            'cost_php'    => $costPhp,
            'model'       => 'claude-sonnet-4-6',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    /**
     * Calculate cost in PHP given token counts.
     */
    public function calculateCost(int $tokensIn, int $tokensOut): float
    {
        $costUsd = ($tokensIn / 1_000_000 * self::INPUT_COST_M)
                 + ($tokensOut / 1_000_000 * self::OUTPUT_COST_M);
        return round($costUsd * self::USD_PHP, 4);
    }

    /**
     * Get quota status for API responses.
     */
    public function status(User $user): array
    {
        $this->maybeResetMonthly($user);
        $plan  = $user->plan ?? 'free';
        $limit = self::PLAN_LIMITS[$plan] ?? 10;
        $used  = $user->ai_quota_used ?? 0;

        return [
            'plan'          => $plan,
            'used'          => $used,
            'limit'         => $limit,
            'remaining'     => max(0, $limit - $used),
            'pct_used'      => $limit > 0 ? round(($used / $limit) * 100) : 100,
            'resets_at'     => $user->ai_quota_reset_at,
            'is_unlimited'  => $plan === 'pro',
            'can_use_ai'    => $used < $limit && $plan !== 'b2b_basic',
        ];
    }

    /**
     * Apply a new subscription plan to a user.
     */
    public function applyPlan(User $user, string $plan, int $quotaGranted, string $gateway, ?string $gatewayRef = null, float $amountPhp = 0): void
    {
        $user->update([
            'plan'               => $plan,
            'ai_quota_limit'     => $quotaGranted,
            'ai_quota_used'      => 0, // reset on new sub
            'ai_quota_reset_at'  => now()->addMonth(),
        ]);

        DB::table('subscriptions')->insert([
            'user_id'       => $user->id,
            'plan'          => $plan,
            'status'        => 'active',
            'gateway'       => $gateway,
            'gateway_ref'   => $gatewayRef,
            'amount'        => $amountPhp,
            'quota_granted' => $quotaGranted,
            'starts_at'     => now(),
            'expires_at'    => now()->addMonth(),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    /**
     * Reset quota at start of new billing month if needed.
     */
    private function maybeResetMonthly(User $user): void
    {
        $resetAt = $user->ai_quota_reset_at;
        if ($resetAt && now()->greaterThan($resetAt)) {
            $user->update([
                'ai_quota_used'     => 0,
                'ai_quota_reset_at' => now()->addMonth(),
            ]);
        }
    }
}
