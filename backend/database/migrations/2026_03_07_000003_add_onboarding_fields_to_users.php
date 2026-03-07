<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'learning_goal'))
                $table->string('learning_goal')->nullable()->after('school_name');
            if (!Schema::hasColumn('users', 'learning_challenge'))
                $table->string('learning_challenge')->nullable()->after('learning_goal');
            if (!Schema::hasColumn('users', 'learning_style'))
                $table->string('learning_style')->nullable()->after('learning_challenge');
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['learning_goal', 'learning_challenge', 'learning_style']);
        });
    }
};
