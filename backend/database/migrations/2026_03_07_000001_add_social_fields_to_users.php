<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar_url'))
                $table->string('avatar_url')->nullable()->after('email');
            if (!Schema::hasColumn('users', 'social_provider'))
                $table->string('social_provider')->nullable()->after('avatar_url');
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'social_provider']);
        });
    }
};
