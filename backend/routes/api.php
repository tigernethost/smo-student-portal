<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;

Route::get('/health', fn() => response()->json(['status' => 'ok', 'version' => '1.0.0', 'timestamp' => now()->toISOString()]));

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/profile', [StudentController::class, 'profile']);
    Route::get('/student/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/student/attendance', [StudentController::class, 'attendance']);
    Route::get('/student/goals', [StudentController::class, 'goals']);
    Route::post('/student/goals', [StudentController::class, 'storeGoal']);
    Route::put('/student/goals/{id}', [StudentController::class, 'updateGoal']);
    Route::delete('/student/goals/{id}', [StudentController::class, 'deleteGoal']);

    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    Route::get('/subjects/{id}/grades', [SubjectController::class, 'grades']);
    Route::get('/subjects/{id}/topics', [SubjectController::class, 'topics']);
    Route::get('/subjects/{id}/attendance', [SubjectController::class, 'attendance']);

    Route::get('/learning-path', [StudentController::class, 'learningPath']);
    Route::get('/analytics', [StudentController::class, 'analytics']);
    Route::get('/recommendations', [StudentController::class, 'recommendations']);
    Route::get('/notifications', [StudentController::class, 'notifications']);
});
