<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Add invite token to parent_student_links for parent-created student accounts
        Schema::table('parent_student_links', function (Blueprint $table) {
            $table->string('invite_token')->nullable()->unique()->after('link_code');
            $table->timestamp('invite_expires_at')->nullable()->after('invite_token');
            $table->boolean('invite_accepted')->default(false)->after('invite_expires_at');
        });

        // Add flag to users table so we know if account was created by parent
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('created_by_parent')->default(false)->after('parent_link_code');
            $table->unsignedBigInteger('created_by_parent_id')->nullable()->after('created_by_parent');
        });
    }

    public function down(): void {
        Schema::table('parent_student_links', function (Blueprint $table) {
            $table->dropColumn(['invite_token', 'invite_expires_at', 'invite_accepted']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['created_by_parent', 'created_by_parent_id']);
        });
    }
};
