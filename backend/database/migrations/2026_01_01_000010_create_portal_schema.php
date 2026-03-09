<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Guard: skip if already migrated
        if (Schema::hasTable('subjects')) {
            return;
        }
        // Extend users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'grade_level'))
                $table->tinyInteger('grade_level')->nullable()->after('email');
            if (!Schema::hasColumn('users', 'strand'))
                $table->string('strand')->nullable()->after('grade_level');
            if (!Schema::hasColumn('users', 'school_name'))
                $table->string('school_name')->nullable()->after('strand');
            if (!Schema::hasColumn('users', 'onboarding_done'))
                $table->boolean('onboarding_done')->default(false)->after('school_name');
            if (!Schema::hasColumn('users', 'role'))
                $table->string('role')->default('student')->after('onboarding_done');
        });

        // Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('icon')->default('📚');
            $table->string('color')->default('#2563eb');
            $table->tinyInteger('grade_level')->nullable();
            $table->string('track')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Topics per subject
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->tinyInteger('quarter')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Student subject enrollments
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->string('school_year')->default('2025-2026');
            $table->tinyInteger('quarter')->default(3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'subject_id', 'school_year']);
        });

        // Uploaded documents
        Schema::create('student_uploads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('exam');         // exam|quiz|assignment|report_card
            $table->string('file_url');
            $table->string('file_name')->nullable();
            $table->string('original_name')->nullable();
            $table->string('status')->default('pending');    // pending|processing|done|failed
            $table->json('ai_result')->nullable();
            $table->decimal('extracted_score', 5, 2)->nullable();
            $table->decimal('extracted_total', 5, 2)->nullable();
            $table->string('extracted_subject')->nullable();
            $table->tinyInteger('extracted_quarter')->nullable();
            $table->json('weak_topics')->nullable();
            $table->text('ai_summary')->nullable();
            $table->timestamps();
        });

        // Topic mastery per student
        Schema::create('student_topic_mastery', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('topic_id')->constrained()->onDelete('cascade');
            $table->decimal('mastery_score', 5, 2)->default(0);
            $table->integer('attempts')->default(0);
            $table->integer('correct')->default(0);
            $table->integer('incorrect')->default(0);
            $table->string('status')->default('available'); // available|in-progress|mastered|at-risk
            $table->timestamp('last_attempted_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'topic_id']);
        });

        // Quiz sessions
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('upload_id')->nullable()->constrained('student_uploads')->nullOnDelete();
            $table->string('source')->default('manual');     // manual|ai_recommended|upload_followup
            $table->integer('total_questions')->default(10);
            $table->integer('answered')->default(0);
            $table->integer('correct')->default(0);
            $table->decimal('score_pct', 5, 2)->nullable();
            $table->string('status')->default('active');     // active|completed|abandoned
            $table->json('questions')->nullable();
            $table->timestamps();
        });

        // Quiz questions
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('question_number');
            $table->text('question');
            $table->json('choices');
            $table->string('correct_answer');
            $table->string('student_answer')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->text('explanation')->nullable();
            $table->timestamps();
        });

        // Analytics snapshots
        Schema::create('analytics_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('overall_score', 5, 2)->default(0);
            $table->json('subject_scores')->nullable();
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('at_risk_topics')->nullable();
            $table->json('recommended_topics')->nullable();
            $table->integer('total_quizzes')->default(0);
            $table->integer('total_uploads')->default(0);
            $table->string('risk_level')->default('low');
            $table->text('ai_summary')->nullable();
            $table->timestamps();
        });

        // Recommendations
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('priority')->default('medium');
            $table->string('type')->default('study');
            $table->text('reason');
            $table->boolean('is_dismissed')->default(false);
            $table->boolean('is_acted')->default(false);
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->string('icon')->default('🔔');
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        // Student goals
    }

    public function down(): void
    {
        Schema::dropIfExists('student_goals');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('analytics_snapshots');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quiz_sessions');
        Schema::dropIfExists('student_topic_mastery');
        Schema::dropIfExists('student_uploads');
        Schema::dropIfExists('student_subjects');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
    }
};
