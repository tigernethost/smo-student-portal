<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, StudentController, UploadController, QuizController, SocialAuthController, SubscriptionController};

Route::get('/health', function() {
    $key = env('ANTHROPIC_API_KEY', '');
    return response()->json([
        'status'        => 'ok',
        'version'       => '2.1.0',
        'timestamp'     => now()->toISOString(),
        'ai_key_prefix' => !empty($key) ? substr($key, 0, 14) . '...' : 'NOT SET',
    ]);
});

// Auth (email + social)
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me',        [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Social OAuth
    Route::get('/redirect/{provider}', [SocialAuthController::class, 'redirect']);
    Route::get('/callback/{provider}', [SocialAuthController::class, 'callback']);
});

// Public
Route::get('/subjects', [StudentController::class, 'availableSubjects']);

// Public — Parent payment (no login)
Route::get('/subscription/parent/{token}',          [SubscriptionController::class, 'parentInfo']);
Route::post('/subscription/parent/{token}/checkout',[SubscriptionController::class, 'parentCheckout']);

// Paynamics webhook (no auth — webhook comes from Paynamics server)
Route::post('/subscription/webhook', [SubscriptionController::class, 'webhook']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    // Profile
    Route::get('/student/profile',   [StudentController::class, 'profile']);
    Route::put('/student/profile',   [StudentController::class, 'updateProfile']);
    Route::post('/student/profile',  [StudentController::class, 'updateProfile']); // FormData from onboarding

    // Dashboard & analytics
    Route::get('/student/dashboard',          [StudentController::class, 'dashboard']);
    Route::get('/student/analytics',          [StudentController::class, 'analytics']);
    Route::post('/student/analytics/refresh', [StudentController::class, 'refreshAnalytics']);
    Route::get('/student/learning-path',      [StudentController::class, 'learningPath']);

    // Recommendations
    Route::get('/student/recommendations',                  [StudentController::class, 'recommendations']);
    Route::post('/student/recommendations/{id}/dismiss',    [StudentController::class, 'dismissRecommendation']);

    // Notifications
    Route::get('/student/notifications',                    [StudentController::class, 'notifications']);
    Route::post('/student/notifications/{id}/read',         [StudentController::class, 'markNotificationRead']);
    Route::post('/student/notifications/read-all',          [StudentController::class, 'markAllNotificationsRead']);

    // Goals
    Route::get('/student/goals',          [StudentController::class, 'goals']);
    Route::post('/student/goals',         [StudentController::class, 'storeGoal']);
    Route::put('/student/goals/{id}',     [StudentController::class, 'updateGoal']);
    Route::delete('/student/goals/{id}',  [StudentController::class, 'deleteGoal']);

    // Uploads
    Route::get('/uploads',         [UploadController::class, 'index']);
    Route::post('/uploads',        [UploadController::class, 'store']);
    Route::get('/uploads/{id}',    [UploadController::class, 'show']);
    Route::delete('/uploads/{id}', [UploadController::class, 'destroy']);

    // Quiz
    Route::post('/quiz/generate',           [QuizController::class, 'generate']);
    Route::post('/quiz/{sessionId}/answer', [QuizController::class, 'answer']);
    Route::post('/quiz/{sessionId}/finish', [QuizController::class, 'finish']);
    Route::get('/quiz/history',             [QuizController::class, 'history']);
    Route::get('/quiz/{sessionId}/results', [QuizController::class, 'results']);

    // Subscription & quota
    Route::get('/subscription/status',                [SubscriptionController::class, 'status']);
    Route::post('/subscription/checkout',             [SubscriptionController::class, 'checkout']);
    Route::get('/subscription/history',               [SubscriptionController::class, 'history']);
    Route::post('/subscription/generate-parent-link', [SubscriptionController::class, 'generateParentLink']);
});

// Facebook data deletion callback (required by Facebook Platform Policy)
Route::post('/auth/facebook/deletion', [App\Http\Controllers\DataDeletionController::class, 'facebookDeletion']);
Route::get('/deletion-status',         [App\Http\Controllers\DataDeletionController::class, 'deletionStatus']);

// One-time setup endpoint (protected by secret key)
Route::post('/setup/migrate', function() {
    $secret  = request()->header('X-Setup-Key');
    $allowed = env('SETUP_SECRET', 'smo-curriculum-seed-2026');
    if ($secret !== $allowed) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    try {
        \Artisan::call('migrate', ['--force' => true]);
        $output = \Artisan::output();
        return response()->json(['message' => 'Migrations run', 'output' => $output]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::post('/setup/seed', function() {
    $secret = request()->header('X-Setup-Key');
    $allowed = env('SETUP_SECRET', 'smo-curriculum-seed-2026');
    if ($secret !== $allowed) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    try {
        \Artisan::call('db:seed', ['--force' => true]);
        $output = \Artisan::output();
        return response()->json([
            'message' => 'Seeded successfully',
            'output' => $output,
            'subjects' => \DB::table('subjects')->count(),
            'topics' => \DB::table('topics')->count(),
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Make a user an admin
Route::post('/setup/make-admin', function() {
    $secret = request()->header('X-Setup-Key');
    $allowed = env('SETUP_SECRET', 'smo-curriculum-seed-2026');
    if ($secret !== $allowed) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    $email = request()->input('email');
    $user = \App\Models\User::where('email', $email)->first();
    if (!$user) {
        return response()->json(['error' => "No user found with email: $email"], 404);
    }
    $user->update(['is_admin' => true]);
    return response()->json(['message' => "Admin access granted to {$user->name} ({$user->email})"]);
});

// Clear all caches
Route::post('/setup/clear-cache', function() {
    $secret = request()->header('X-Setup-Key');
    $allowed = env('SETUP_SECRET', 'smo-curriculum-seed-2026');
    if ($secret !== $allowed) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    \Artisan::call('route:clear');
    \Artisan::call('config:clear');
    \Artisan::call('cache:clear');
    \Artisan::call('view:clear');
    return response()->json(['message' => 'All caches cleared']);
});

// ─── Parent Portal ───────────────────────────────────────────────────────────
use App\Http\Controllers\ParentAuthController;
use App\Http\Controllers\ParentDashboardController;

// Public — register & login
Route::prefix('parent/auth')->group(function () {
    Route::post('/register', [ParentAuthController::class, 'register']);
    Route::post('/login',    [ParentAuthController::class, 'login']);
});

// Protected — requires parent token
Route::prefix('parent')->middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me',               [ParentAuthController::class, 'me']);
    Route::post('/auth/logout',          [ParentAuthController::class, 'logout']);
    Route::post('/auth/link',            [ParentAuthController::class, 'linkChild']);

    Route::get('/children',                          [ParentDashboardController::class, 'children']);
    Route::get('/children/{id}/dashboard',           [ParentDashboardController::class, 'dashboard']);
    Route::get('/children/{id}/performance',         [ParentDashboardController::class, 'performance']);

    Route::get('/notifications',                     [ParentDashboardController::class, 'notifications']);
    Route::post('/notifications/read-all',           [ParentDashboardController::class, 'readAllNotifications']);
});

// Student — generate their own parent link code
Route::middleware('auth:sanctum')->post('/student/parent-link-code', function () {
    $user = request()->user();
    $code = $user->generateParentLinkCode();
    return response()->json(['link_code' => $code, 'message' => 'Share this code with your parent to link their account.']);
});

// ─── Parent Portal ────────────────────────────────────────────────────────────
Route::prefix('parent')->group(function () {
    // Auth (public)
    Route::post('/auth/register', [App\Http\Controllers\ParentAuthController::class, 'register']);
    Route::post('/auth/login',    [App\Http\Controllers\ParentAuthController::class, 'login']);

    // Protected
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me',            [App\Http\Controllers\ParentAuthController::class, 'me']);
        Route::post('/auth/logout',       [App\Http\Controllers\ParentAuthController::class, 'logout']);
        Route::post('/auth/link',         [App\Http\Controllers\ParentAuthController::class, 'linkChild']);

        Route::get('/children',                         [App\Http\Controllers\ParentDashboardController::class, 'children']);
        Route::get('/children/{id}/dashboard',          [App\Http\Controllers\ParentDashboardController::class, 'dashboard']);
        Route::get('/children/{id}/performance',        [App\Http\Controllers\ParentDashboardController::class, 'performance']);
        Route::get('/notifications',                    [App\Http\Controllers\ParentDashboardController::class, 'notifications']);
        Route::post('/notifications/read-all',          [App\Http\Controllers\ParentDashboardController::class, 'readAllNotifications']);
    });
});

// Student: get/generate their parent link code
Route::middleware('auth:sanctum')->get('/student/parent-link-code', function (\Illuminate\Http\Request $request) {
    $user = $request->user();
    $code = $user->generateParentLinkCode();
    return response()->json([
        'link_code'   => $code,
        'share_url'   => config('app.url') . '/parent/register?code=' . $code,
        'share_text'  => "Join " . ($user->name ?? 'my') . "'s SchoolMATE portal as a parent. Use code: {$code} or visit: " . config('app.url') . "/parent/register?code={$code}",
    ]);
});
