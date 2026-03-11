<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Parent subscriptions table
        Schema::create('parent_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('parent_accounts')->cascadeOnDelete();
            $table->string('plan'); // basic, pro
            $table->string('status')->default('pending'); // pending, active, expired, cancelled
            $table->string('gateway')->default('paynamics');
            $table->string('gateway_ref')->nullable();
            $table->decimal('amount', 10, 2);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Expand subscription_tier on parent_accounts to include basic/pro
        Schema::table('parent_accounts', function (Blueprint $table) {
            $table->string('subscription_tier')->default('free')->change();
        });
    }

    public function down(): void {
        Schema::dropIfExists('parent_subscriptions');
    }
};
