<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Parent accounts (separate from student users)
        Schema::create('parent_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('email_verification_token')->nullable();
            $table->enum('subscription_tier', ['free','premium'])->default('free');
            $table->rememberToken();
            $table->timestamps();
        });

        // Links between parents and students
        Schema::create('parent_student_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('parent_accounts')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('relationship')->default('Guardian'); // Mother/Father/Guardian
            $table->string('link_code')->nullable(); // code student shares
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['parent_id','student_id']);
        });

        // Parent notifications
        Schema::create('parent_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('parent_accounts')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('type'); // quiz_completed, at_risk, goal_achieved, etc.
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('parent_notifications');
        Schema::dropIfExists('parent_student_links');
        Schema::dropIfExists('parent_accounts');
    }
};
