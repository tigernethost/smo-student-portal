<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'plan'))
                $table->string('plan')->default('free')->after('role');
            if (!Schema::hasColumn('users', 'ai_quota_used'))
                $table->integer('ai_quota_used')->default(0)->after('plan');
            if (!Schema::hasColumn('users', 'ai_quota_limit'))
                $table->integer('ai_quota_limit')->default(10)->after('ai_quota_used');
            if (!Schema::hasColumn('users', 'ai_quota_reset_at'))
                $table->timestamp('ai_quota_reset_at')->nullable()->after('ai_quota_limit');
            if (!Schema::hasColumn('users', 'parent_payment_token'))
                $table->string('parent_payment_token')->nullable()->unique()->after('ai_quota_reset_at');
        });

        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('plan');
                $table->string('status')->default('pending');
                $table->string('gateway')->nullable();
                $table->string('gateway_ref')->nullable();
                $table->string('gateway_status')->nullable();
                $table->decimal('amount', 10, 2);
                $table->string('currency')->default('PHP');
                $table->integer('quota_granted')->default(0);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->json('meta')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('ai_usage_logs')) {
            Schema::create('ai_usage_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('action_type');
                $table->integer('tokens_in')->default(0);
                $table->integer('tokens_out')->default(0);
                $table->decimal('cost_php', 8, 4)->default(0);
                $table->string('model')->default('claude-sonnet-4-6');
                $table->json('meta')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
        Schema::dropIfExists('subscriptions');
        Schema::table('users', function (Blueprint $table) {
            $cols = ['plan','ai_quota_used','ai_quota_limit','ai_quota_reset_at','parent_payment_token'];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('users', $c));
            if ($existing) $table->dropColumn(array_values($existing));
        });
    }
};
