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
        // Token-based auth only — no stateful session middleware
        $middleware->validateCsrfTokens(except: [
            'api/auth/callback/*',
            'api/auth/facebook/deletion',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, Request $request) {
            // Only intercept true unhandled API errors (not redirects from controllers)
            if ($request->is('api/*') && !($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException)) {
                \Illuminate\Support\Facades\Log::error('Unhandled API exception', [
                    'url'     => $request->fullUrl(),
                    'message' => $e->getMessage(),
                    'class'   => get_class($e),
                    'file'    => $e->getFile() . ':' . $e->getLine(),
                ]);

                // For OAuth callbacks, redirect to login with the real error
                if ($request->is('api/auth/callback/*')) {
                    $frontendUrl = env('FRONTEND_URL', 'https://portal.schoolmate-online.net');
                    $msg = config('app.debug') ? $e->getMessage() : 'Authentication failed. Please try again.';
                    return redirect("{$frontendUrl}/login?error=" . urlencode($msg));
                }

                return response()->json([
                    'message' => config('app.debug') ? $e->getMessage() : 'Server error',
                ], 500);
            }
        });
    })->create();
