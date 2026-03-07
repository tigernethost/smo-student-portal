<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Recommendation extends Model {
    protected $fillable = ['user_id','subject_id','topic_id','priority','type','reason','is_dismissed','is_acted'];
    public function subject() { return $this->belongsTo(Subject::class); }
    public function topic() { return $this->belongsTo(Topic::class); }
}
