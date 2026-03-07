<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Topic extends Model {
    protected $fillable = ['subject_id','name','description','quarter','sort_order'];
    public function subject() { return $this->belongsTo(Subject::class); }
    public function mastery() { return $this->hasMany(StudentTopicMastery::class); }
}
