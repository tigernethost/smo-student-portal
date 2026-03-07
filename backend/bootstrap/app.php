<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // No statefulApi — we use token-based auth only (Sanctum bearer tokens)
        // Exclude social callback routes from any CSRF/session requirements
        $middleware->validateCsrfTokens(except: [
            'api/auth/callback/*',
            'api/auth/facebook/deletion',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for all API exceptions instead of HTML error pages
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                \Illuminate\Support\Facades\Log::error('API exception', [
                    'url'     => $request->fullUrl(),
                    'message' => $e->getMessage(),
                    'class'   => get_class($e),
                    'trace'   => collect($e->getTrace())->take(5)->toArray(),
                ]);
                // For OAuth callbacks, redirect to frontend with error
                if ($request->is('api/auth/callback/*')) {
                    $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');
                    return redirect("{$frontendUrl}/login?error=" . urlencode('Authentication failed: ' . $e->getMessage()));
                }
                return response()->json([
                    'message' => config('app.debug') ? $e->getMessage() : 'Server error',
                    'class'   => config('app.debug') ? get_class($e) : null,
                ], 500);
            }
        });
    })->create();
