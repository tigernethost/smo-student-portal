<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AIService;
use App\Services\AnalyticsService;
use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\Apple\AppleExtendSocialite;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AIService::class);
        $this->app->singleton(AnalyticsService::class, function ($app) {
            return new AnalyticsService($app->make(AIService::class));
        });
    }

    public function boot(): void
    {
        \Illuminate\Support\Facades\URL::forceScheme('https');

        // Register Apple Socialite provider
        \Illuminate\Support\Facades\Event::listen(
            SocialiteWasCalled::class,
            AppleExtendSocialite::class . '@handle'
        );
    }
}
