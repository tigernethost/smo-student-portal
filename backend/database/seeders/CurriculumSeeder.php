<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name'=>'Mathematics','code'=>'MATH','icon'=>'📐','color'=>'#2563eb','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Number Sense & Numeration','quarter'=>1],
                ['name'=>'Fractions & Decimals','quarter'=>1],
                ['name'=>'Ratio & Proportion','quarter'=>1],
                ['name'=>'Algebraic Expressions','quarter'=>1],
                ['name'=>'Linear Equations','quarter'=>2],
                ['name'=>'Systems of Equations','quarter'=>2],
                ['name'=>'Inequalities','quarter'=>2],
                ['name'=>'Functions & Relations','quarter'=>2],
                ['name'=>'Geometry – Lines & Angles','quarter'=>3],
                ['name'=>'Triangles & Congruence','quarter'=>3],
                ['name'=>'Quadrilaterals & Polygons','quarter'=>3],
                ['name'=>'Circles','quarter'=>3],
                ['name'=>'Statistics & Probability','quarter'=>4],
                ['name'=>'Data Analysis','quarter'=>4],
                ['name'=>'Problem Solving Strategies','quarter'=>4],
            ]],
            ['name'=>'English','code'=>'ENG','icon'=>'📖','color'=>'#7c3aed','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Grammar & Mechanics','quarter'=>1],
                ['name'=>'Vocabulary & Word Study','quarter'=>1],
                ['name'=>'Reading Comprehension','quarter'=>1],
                ['name'=>'Literary Genres & Devices','quarter'=>2],
                ['name'=>'Poetry & Fiction','quarter'=>2],
                ['name'=>'Non-Fiction & Informational Text','quarter'=>2],
                ['name'=>'Expository Writing','quarter'=>3],
                ['name'=>'Persuasive Writing','quarter'=>3],
                ['name'=>'Research & Citation','quarter'=>3],
                ['name'=>'Oral Communication','quarter'=>4],
                ['name'=>'Listening Skills','quarter'=>4],
                ['name'=>'Media Literacy','quarter'=>4],
            ]],
            ['name'=>'Science','code'=>'SCI','icon'=>'🔬','color'=>'#059669','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Scientific Method & Safety','quarter'=>1],
                ['name'=>'Matter & Its Properties','quarter'=>1],
                ['name'=>'Atomic Structure','quarter'=>1],
                ['name'=>'Chemical Bonding','quarter'=>2],
                ['name'=>'Chemical Reactions','quarter'=>2],
                ['name'=>'Acids, Bases & Salts','quarter'=>2],
                ['name'=>'Forces & Motion','quarter'=>3],
                ['name'=>'Energy & Work','quarter'=>3],
                ['name'=>'Waves & Sound','quarter'=>3],
                ['name'=>'Ecosystems & Biodiversity','quarter'=>4],
                ['name'=>'Cell Biology','quarter'=>4],
                ['name'=>'Genetics & Heredity','quarter'=>4],
            ]],
            ['name'=>'Filipino','code'=>'FIL','icon'=>'🇵🇭','color'=>'#d97706','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Gramatika at Retorika','quarter'=>1],
                ['name'=>'Pag-unawa sa Binasa','quarter'=>1],
                ['name'=>'Pagsulat ng Talata','quarter'=>2],
                ['name'=>'Panitikang Pilipino','quarter'=>2],
                ['name'=>'Dula at Malikhaing Pagsulat','quarter'=>3],
                ['name'=>'Oral na Komunikasyon','quarter'=>3],
                ['name'=>'Pananaliksik','quarter'=>4],
                ['name'=>'Pagbasa ng Kritikal','quarter'=>4],
            ]],
            ['name'=>'Araling Panlipunan','code'=>'AP','icon'=>'🌏','color'=>'#dc2626','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Kasaysayan ng Pilipinas','quarter'=>1],
                ['name'=>'Pambansang Kaunlaran','quarter'=>1],
                ['name'=>'Rehiyon ng Asya','quarter'=>2],
                ['name'=>'Pamahalaan at Pulitika','quarter'=>2],
                ['name'=>'Ekonomiya at Kalakalan','quarter'=>3],
                ['name'=>'Kultura at Lipunan','quarter'=>3],
                ['name'=>'Pandaigdigang Kasaysayan','quarter'=>4],
                ['name'=>'Contemporary Issues','quarter'=>4],
            ]],
            ['name'=>'TLE / EPP','code'=>'TLE','icon'=>'🔧','color'=>'#0891b2','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Entrepreneurship Basics','quarter'=>1],
                ['name'=>'ICT & Computer Skills','quarter'=>1],
                ['name'=>'Home Economics','quarter'=>2],
                ['name'=>'Agriculture & Fisheries','quarter'=>2],
                ['name'=>'Industrial Arts','quarter'=>3],
                ['name'=>'Business & Management','quarter'=>4],
            ]],
            ['name'=>'MAPEH','code'=>'MAPEH','icon'=>'🎨','color'=>'#db2777','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Music – Theory & Reading','quarter'=>1],
                ['name'=>'Arts – Visual Arts','quarter'=>1],
                ['name'=>'Physical Education – Sports','quarter'=>2],
                ['name'=>'Health – Personal Wellness','quarter'=>2],
                ['name'=>'Music – Performance','quarter'=>3],
                ['name'=>'Arts – Creative Expression','quarter'=>3],
                ['name'=>'PE – Fitness & Nutrition','quarter'=>4],
                ['name'=>'Health – Community Health','quarter'=>4],
            ]],
            ['name'=>'Values Education','code'=>'VAL','icon'=>'🌟','color'=>'#9333ea','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Personal Development','quarter'=>1],
                ['name'=>'Family & Community','quarter'=>2],
                ['name'=>'Civic Responsibility','quarter'=>3],
                ['name'=>'Ethics & Moral Reasoning','quarter'=>4],
            ]],
        ];

        foreach ($subjects as $subjectData) {
            $topics = $subjectData['topics'];
            unset($subjectData['topics']);
            $subjectData['created_at'] = now();
            $subjectData['updated_at'] = now();

            $subjectId = DB::table('subjects')->insertGetId($subjectData);

            foreach ($topics as $i => $topic) {
                DB::table('topics')->insert([
                    'subject_id' => $subjectId,
                    'name' => $topic['name'],
                    'quarter' => $topic['quarter'],
                    'sort_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
