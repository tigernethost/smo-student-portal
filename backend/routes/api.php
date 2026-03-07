<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, StudentController, UploadController, QuizController, SocialAuthController};

Route::get('/health', fn() => response()->json(['status'=>'ok','version'=>'2.0.0','timestamp'=>now()->toISOString()]));

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

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/profile',  [StudentController::class, 'profile']);
    Route::put('/student/profile',  [StudentController::class, 'updateProfile']);

    Route::get('/student/dashboard',        [StudentController::class, 'dashboard']);
    Route::get('/student/analytics',        [StudentController::class, 'analytics']);
    Route::post('/student/analytics/refresh',[StudentController::class, 'refreshAnalytics']);
    Route::get('/student/learning-path',    [StudentController::class, 'learningPath']);

    Route::get('/student/recommendations',                       [StudentController::class, 'recommendations']);
    Route::post('/student/recommendations/{id}/dismiss',         [StudentController::class, 'dismissRecommendation']);

    Route::get('/student/notifications',                         [StudentController::class, 'notifications']);
    Route::post('/student/notifications/{id}/read',              [StudentController::class, 'markNotificationRead']);
    Route::post('/student/notifications/read-all',               [StudentController::class, 'markAllNotificationsRead']);

    Route::get('/student/goals',     [StudentController::class, 'goals']);
    Route::post('/student/goals',    [StudentController::class, 'storeGoal']);
    Route::put('/student/goals/{id}',[StudentController::class, 'updateGoal']);
    Route::delete('/student/goals/{id}',[StudentController::class, 'deleteGoal']);

    Route::get('/uploads',        [UploadController::class, 'index']);
    Route::post('/uploads',       [UploadController::class, 'store']);
    Route::get('/uploads/{id}',   [UploadController::class, 'show']);
    Route::delete('/uploads/{id}',[UploadController::class, 'destroy']);

    Route::post('/quiz/generate',              [QuizController::class, 'generate']);
    Route::post('/quiz/{sessionId}/answer',    [QuizController::class, 'answer']);
    Route::post('/quiz/{sessionId}/finish',    [QuizController::class, 'finish']);
    Route::get('/quiz/history',                [QuizController::class, 'history']);
    Route::get('/quiz/{sessionId}/results',    [QuizController::class, 'results']);
});
