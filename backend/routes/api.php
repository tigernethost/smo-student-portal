<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, StudentController, UploadController, QuizController, SocialAuthController, SubscriptionController};

Route::get('/health', fn() => response()->json(['status'=>'ok','version'=>'2.1.0','timestamp'=>now()->toISOString()]));

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
Route::post('/setup/seed', function() {
    $secret = request()->header('X-Setup-Key');
    if ($secret !== env('SETUP_SECRET', '')) {
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
