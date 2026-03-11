<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AIQuotaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function __construct(private AIQuotaService $quota) {}

    /**
     * GET /api/subscription/status
     * Returns current plan, quota, and billing info.
     */
    public function status(Request $request)
    {
        $user   = $request->user();
        $status = $this->quota->status($user);
        $sub    = DB::table('subscriptions')
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->orderByDesc('created_at')
                    ->first();

        return response()->json([
            'quota'        => $status,
            'subscription' => $sub ? [
                'plan'       => $sub->plan,
                'started_at' => $sub->starts_at,
                'expires_at' => $sub->expires_at,
                'amount'     => $sub->amount,
                'gateway'    => $sub->gateway,
            ] : null,
            'upgrade_available' => in_array($user->plan ?? 'free', ['free', 'basic']),
        ]);
    }

    /**
     * POST /api/subscription/checkout
     * Initiate Paynamics checkout for Basic or Pro plan.
     * Body: { plan: 'basic'|'pro' }
     */
    public function checkout(Request $request)
    {
        $request->validate(['plan' => 'required|in:basic,pro']);
        $user = $request->user();
        $plan = $request->plan;

        $planConfig = [
            'basic' => ['amount' => 99,  'quota' => 75,  'label' => 'SchoolMATE Basic'],
            'pro'   => ['amount' => 199, 'quota' => 999, 'label' => 'SchoolMATE Pro'],
        ];
        $config = $planConfig[$plan];

        // Generate internal reference
        $internalRef = 'SMO-' . strtoupper(Str::random(10)) . '-' . $user->id;

        // Build Paynamics request
        $merchantId  = env('PAYNAMICS_MERCHANT_ID', '');
        $merchantKey = env('PAYNAMICS_MERCHANT_KEY', '');
        $appUrl      = env('APP_URL', 'https://portal.schoolmate-online.net');
        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');

        // Store pending subscription
        DB::table('subscriptions')->insert([
            'user_id'     => $user->id,
            'plan'        => $plan,
            'status'      => 'pending',
            'gateway'     => 'paynamics',
            'gateway_ref' => $internalRef,
            'amount'      => $config['amount'],
            'quota_granted' => $config['quota'],
            'starts_at'   => null,
            'expires_at'  => null,
            'meta'        => json_encode(['internal_ref' => $internalRef, 'initiated_at' => now()]),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Build Paynamics XML payload
        $amountStr   = number_format($config['amount'], 2, '.', '');
        $requestBody = '<?xml version="1.0" encoding="utf-8" ?><paymentrequest>'
            . '<mid>' . $merchantId . '</mid>'
            . '<request_id>' . $internalRef . '</request_id>'
            . '<ip_address>' . $request->ip() . '</ip_address>'
            . '<notification_url>' . $appUrl . '/api/subscription/webhook</notification_url>'
            . '<response_url>' . $frontendUrl . '/upgrade/success</response_url>'
            . '<cancel_url>' . $frontendUrl . '/upgrade</cancel_url>'
            . '<descriptor>' . $config['label'] . '</descriptor>'
            . '<fname>' . e($user->name) . '</fname>'
            . '<lname></lname>'
            . '<email>' . e($user->email) . '</email>'
            . '<amount>' . $amountStr . '</amount>'
            . '<currency>PHP</currency>'
            . '<mlogo_url>' . $frontendUrl . '/logo.png</mlogo_url>'
            . '<pmethod></pmethod>'
            . '</paymentrequest>';

        $signature = hash('sha512', $merchantId . $internalRef . $amountStr . 'PHP' . $merchantKey);

        // If Paynamics not configured, return demo mode
        if (!$merchantId || !$merchantKey) {
            return response()->json([
                'demo_mode'    => true,
                'message'      => 'Paynamics not configured. In production this redirects to hosted payment page.',
                'internal_ref' => $internalRef,
                'plan'         => $plan,
                'amount'       => $config['amount'],
            ]);
        }

        return response()->json([
            'paynamics_url'  => 'https://www.paynamics.net/ptiwebpayment/Default.aspx',
            'request_body'   => base64_encode($requestBody),
            'signature'      => $signature,
            'internal_ref'   => $internalRef,
        ]);
    }

    /**
     * POST /api/subscription/webhook
     * Paynamics payment notification.
     */
    public function webhook(Request $request)
    {
        $merchantId  = env('PAYNAMICS_MERCHANT_ID', '');
        $merchantKey = env('PAYNAMICS_MERCHANT_KEY', '');

        $responseBody = $request->input('responsedata', '');
        $signature    = $request->input('signature', '');

        if (!$responseBody) {
            return response()->json(['error' => 'No response data'], 400);
        }

        // Decode and parse Paynamics XML response
        try {
            $xml = simplexml_load_string(base64_decode($responseBody));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid XML'], 400);
        }

        $requestId     = (string)$xml->request_id;
        $status        = (string)$xml->status;
        $responseCode  = (string)$xml->response_code;

        // Find pending subscription
        $sub = DB::table('subscriptions')
                  ->where('gateway_ref', $requestId)
                  ->where('status', 'pending')
                  ->first();

        if (!$sub) {
            return response()->json(['error' => 'Subscription not found'], 404);
        }

        if ($status === 'S' || $responseCode === 'GR001') {
            // Payment success
            $user = User::find($sub->user_id);
            if ($user) {
                $planConfig = [
                    'basic' => 75,
                    'pro'   => 999,
                ];
                $quota = $planConfig[$sub->plan] ?? 75;
                $this->quota->applyPlan($user, $sub->plan, $quota, 'paynamics', $requestId, $sub->amount);
            }

            DB::table('subscriptions')->where('id', $sub->id)->update([
                'status'         => 'active',
                'gateway_status' => $responseCode,
                'starts_at'      => now(),
                'expires_at'     => now()->addMonth(),
                'updated_at'     => now(),
            ]);
        } else {
            DB::table('subscriptions')->where('id', $sub->id)->update([
                'status'         => 'failed',
                'gateway_status' => $responseCode,
                'updated_at'     => now(),
            ]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * GET /api/subscription/history
     * Past subscriptions for the user.
     */
    public function history(Request $request)
    {
        $history = DB::table('subscriptions')
                     ->where('user_id', $request->user()->id)
                     ->orderByDesc('created_at')
                     ->get();
        return response()->json($history);
    }

    /**
     * POST /api/subscription/generate-parent-link
     * Generate a shareable payment link for parents (no login needed).
     */
    public function generateParentLink(Request $request)
    {
        $user  = $request->user();
        $token = $user->parent_payment_token ?? Str::random(32);
        $user->update(['parent_payment_token' => $token]);

        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');
        return response()->json([
            'token'       => $token,
            'payment_url' => "{$frontendUrl}/upgrade/parent/{$token}",
            'message'     => 'Share this link with your parent. They can pay without logging in.',
        ]);
    }

    /**
     * GET /api/subscription/parent/{token}
     * Public endpoint — returns student info for parent payment page.
     */
    public function parentInfo(string $token)
    {
        $user = User::where('parent_payment_token', $token)->first();
        if (!$user) return response()->json(['error' => 'Invalid or expired link.'], 404);

        return response()->json([
            'student_name'  => $user->name,
            'grade_level'   => $user->grade_level,
            'current_plan'  => $user->plan ?? 'free',
            'school'        => $user->school_name,
            'token'         => $token,
            'plans'         => [
                ['id'=>'basic','label'=>'Basic','price'=>99,'quota'=>75,'description'=>'75 AI actions/month'],
                ['id'=>'pro',  'label'=>'Pro',  'price'=>199,'quota'=>999,'description'=>'Unlimited AI actions'],
            ],
        ]);
    }

    /**
     * POST /api/subscription/parent/{token}/checkout
     * Public endpoint — parent initiates payment on behalf of student.
     */
    public function parentCheckout(Request $request, string $token)
    {
        $request->validate(['plan' => 'required|in:basic,pro']);
        $user = User::where('parent_payment_token', $token)->first();
        if (!$user) return response()->json(['error' => 'Invalid or expired link.'], 404);

        // Reuse the checkout logic but for the student user
        $request->merge(['user_override_id' => $user->id]);
        return $this->checkoutForUser($user, $request->plan);
    }

    private function checkoutForUser(User $user, string $plan)
    {
        $planConfig = [
            'basic' => ['amount' => 99,  'quota' => 75,  'label' => 'SchoolMATE Basic'],
            'pro'   => ['amount' => 199, 'quota' => 999, 'label' => 'SchoolMATE Pro'],
        ];
        $config      = $planConfig[$plan];
        $internalRef = 'SMO-PAR-' . strtoupper(Str::random(8)) . '-' . $user->id;
        $merchantId  = env('PAYNAMICS_MERCHANT_ID', '');
        $merchantKey = env('PAYNAMICS_MERCHANT_KEY', '');
        $appUrl      = env('APP_URL', 'https://portal.schoolmate-online.net');
        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');

        DB::table('subscriptions')->insert([
            'user_id'       => $user->id,
            'plan'          => $plan,
            'status'        => 'pending',
            'gateway'       => 'paynamics',
            'gateway_ref'   => $internalRef,
            'amount'        => $config['amount'],
            'quota_granted' => $config['quota'],
            'starts_at'     => null,
            'expires_at'    => null,
            'meta'          => json_encode(['source' => 'parent_link']),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        if (!$merchantId || !$merchantKey) {
            return response()->json([
                'demo_mode'    => true,
                'message'      => 'Payment gateway not configured.',
                'internal_ref' => $internalRef,
                'plan'         => $plan,
                'amount'       => $config['amount'],
            ]);
        }

        $amountStr   = number_format($config['amount'], 2, '.', '');
        $requestBody = '<?xml version="1.0" encoding="utf-8" ?><paymentrequest>'
            . '<mid>' . $merchantId . '</mid>'
            . '<request_id>' . $internalRef . '</request_id>'
            . '<ip_address>0.0.0.0</ip_address>'
            . '<notification_url>' . $appUrl . '/api/subscription/webhook</notification_url>'
            . '<response_url>' . $frontendUrl . '/upgrade/success?source=parent</response_url>'
            . '<cancel_url>' . $frontendUrl . '/upgrade/parent/' . $user->parent_payment_token . '</cancel_url>'
            . '<descriptor>' . $config['label'] . ' for ' . e($user->name) . '</descriptor>'
            . '<fname>Parent of ' . e($user->name) . '</fname>'
            . '<lname></lname>'
            . '<email>' . e($user->email) . '</email>'
            . '<amount>' . $amountStr . '</amount>'
            . '<currency>PHP</currency>'
            . '</paymentrequest>';

        $signature = hash('sha512', $merchantId . $internalRef . $amountStr . 'PHP' . $merchantKey);

        return response()->json([
            'paynamics_url' => 'https://www.paynamics.net/ptiwebpayment/Default.aspx',
            'request_body'  => base64_encode($requestBody),
            'signature'     => $signature,
            'internal_ref'  => $internalRef,
        ]);
    }

    /**
     * GET /api/parent/subscription/status
     * Returns current parent plan, student limits, and billing info.
     */
    public function parentStatus(Request $request)
    {
        $parent = $request->user();
        $limits = ['free' => 1, 'basic' => 3, 'pro' => PHP_INT_MAX];
        $tier   = $parent->subscription_tier ?? 'free';
        $limit  = $limits[$tier] ?? 1;
        $count  = $parent->students()->count();

        return response()->json([
            'tier'         => $tier,
            'student_count'=> $count,
            'student_limit'=> $limit === PHP_INT_MAX ? null : $limit,
            'can_add_more' => $count < $limit,
            'plans'        => [
                ['id'=>'basic','label'=>'Basic','price'=>99, 'students'=>3,  'description'=>'Up to 3 students, priority support'],
                ['id'=>'pro',  'label'=>'Pro',  'price'=>199,'students'=>null,'description'=>'Unlimited students, all features'],
            ],
        ]);
    }

    /**
     * POST /api/parent/subscription/checkout
     * Parent upgrades their own account to add more student slots.
     * Body: { plan: 'basic'|'pro' }
     */
    public function parentUpgradeCheckout(Request $request)
    {
        $request->validate(['plan' => 'required|in:basic,pro']);
        $parent = $request->user();
        $plan   = $request->plan;

        $planConfig = [
            'basic' => ['amount' => 99,  'students' => 3,   'label' => 'SchoolMATE Parent Basic'],
            'pro'   => ['amount' => 199, 'students' => null, 'label' => 'SchoolMATE Parent Pro'],
        ];
        $config      = $planConfig[$plan];
        $internalRef = 'SMO-PAR-UP-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . $parent->id;

        $merchantId  = env('PAYNAMICS_MERCHANT_ID', '');
        $merchantKey = env('PAYNAMICS_MERCHANT_KEY', '');
        $appUrl      = env('APP_URL', 'https://portal.schoolmate-online.net/api');
        $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');

        // Store pending parent subscription
        \Illuminate\Support\Facades\DB::table('parent_subscriptions')->insert([
            'parent_id'   => $parent->id,
            'plan'        => $plan,
            'status'      => 'pending',
            'gateway'     => 'paynamics',
            'gateway_ref' => $internalRef,
            'amount'      => $config['amount'],
            'starts_at'   => null,
            'expires_at'  => null,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Demo mode if Paynamics not configured
        if (!$merchantId || !$merchantKey) {
            // In demo mode, immediately upgrade the parent tier
            $parent->update(['subscription_tier' => $plan]);
            return response()->json([
                'demo_mode'    => true,
                'message'      => "Demo mode: Your account has been upgraded to {$plan}!",
                'plan'         => $plan,
                'amount'       => $config['amount'],
                'redirect'     => $frontendUrl . '/parent/upgrade/success?plan=' . $plan,
            ]);
        }

        $amountStr   = number_format($config['amount'], 2, '.', '');
        $requestBody = '<?xml version="1.0" encoding="utf-8" ?><paymentrequest>'
            . '<mid>' . $merchantId . '</mid>'
            . '<request_id>' . $internalRef . '</request_id>'
            . '<ip_address>0.0.0.0</ip_address>'
            . '<notification_url>' . $appUrl . '/subscription/webhook</notification_url>'
            . '<response_url>' . $frontendUrl . '/parent/upgrade/success?ref=' . $internalRef . '</response_url>'
            . '<cancel_url>' . $frontendUrl . '/parent/upgrade</cancel_url>'
            . '<descriptor>' . $config['label'] . '</descriptor>'
            . '<fname>' . e($parent->name) . '</fname>'
            . '<lname></lname>'
            . '<email>' . e($parent->email) . '</email>'
            . '<amount>' . $amountStr . '</amount>'
            . '<currency>PHP</currency>'
            . '</paymentrequest>';

        $signature = hash('sha512', $merchantId . $internalRef . $amountStr . 'PHP' . $merchantKey);

        return response()->json([
            'paynamics_url' => 'https://www.paynamics.net/ptiwebpayment/Default.aspx',
            'request_body'  => base64_encode($requestBody),
            'signature'     => $signature,
            'internal_ref'  => $internalRef,
        ]);
    }

}

// NOTE: The closing brace above belongs to the class.
// This file is appended - the methods below must be added inside the class manually.
