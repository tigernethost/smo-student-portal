<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Plan & quota
            $table->string('plan')->default('free')->after('role'); // free|basic|pro|b2b_basic|b2b_ai
            $table->integer('ai_quota_used')->default(0)->after('plan');
            $table->integer('ai_quota_limit')->default(10)->after('ai_quota_used'); // free=10, basic=75, pro=999, b2b_ai=100
            $table->timestamp('ai_quota_reset_at')->nullable()->after('ai_quota_limit');
            // Parent payment token (shareable link, no login needed)
            $table->string('parent_payment_token')->nullable()->unique()->after('ai_quota_reset_at');
        });

        // Subscriptions / payment history
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('plan');                          // basic|pro|b2b_basic|b2b_ai
            $table->string('status')->default('pending');    // pending|active|cancelled|expired
            $table->string('gateway')->nullable();           // paynamics|invoice|manual
            $table->string('gateway_ref')->nullable();       // Paynamics transaction ref
            $table->string('gateway_status')->nullable();    // raw gateway status
            $table->decimal('amount', 10, 2);               // PHP amount charged
            $table->string('currency')->default('PHP');
            $table->integer('quota_granted')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('meta')->nullable();               // gateway response, school info etc
            $table->timestamps();
        });

        // AI usage log (for analytics + billing audit)
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action_type');                  // quiz|upload|summary|recommendation
            $table->integer('tokens_in')->default(0);
            $table->integer('tokens_out')->default(0);
            $table->decimal('cost_php', 8, 4)->default(0); // actual cost in PHP
            $table->string('model')->default('claude-sonnet-4-6');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
        Schema::dropIfExists('subscriptions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan','ai_quota_used','ai_quota_limit','ai_quota_reset_at','parent_payment_token']);
        });
    }
};
