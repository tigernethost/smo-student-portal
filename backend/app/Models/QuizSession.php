<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class QuizSession extends Model {
    protected $fillable = ['user_id','subject_id','topic_id','upload_id','source','total_questions','answered','correct','score_pct','status','questions'];
    protected $casts = ['questions'=>'array'];
    public function questions() { return $this->hasMany(QuizQuestion::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function topic() { return $this->belongsTo(Topic::class); }
}
