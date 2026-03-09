<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentTopicMastery extends Model {
    protected $table = 'student_topic_mastery';
    protected $fillable = ['user_id','topic_id','mastery_score','attempts','correct','incorrect','status','last_attempted_at'];
    public function topic()    { return $this->belongsTo(Topic::class); }
    public function subject()  { return $this->hasOneThrough(Subject::class, Topic::class, 'id', 'id', 'topic_id', 'subject_id'); }
    public function user()     { return $this->belongsTo(User::class); }
}
