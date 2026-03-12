<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Change grade_level from tinyInteger to string to support "Grade 1", "Grade 7", etc.
        DB::statement('ALTER TABLE users ALTER COLUMN grade_level TYPE varchar(50) USING grade_level::varchar');
    }

    public function down(): void {
        DB::statement('ALTER TABLE users ALTER COLUMN grade_level TYPE smallint USING grade_level::smallint');
    }
};
