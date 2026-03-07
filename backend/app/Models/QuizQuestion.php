<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class QuizQuestion extends Model {
    protected $fillable = ['quiz_session_id','topic_id','question_number','question','choices','correct_answer','student_answer','is_correct','explanation'];
    protected $casts = ['choices'=>'array','is_correct'=>'boolean'];
}
