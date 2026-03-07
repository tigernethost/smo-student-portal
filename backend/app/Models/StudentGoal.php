<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentGoal extends Model {
    protected $fillable = ['user_id','subject_id','subject_name','type','target','current_value','deadline','status'];
    public function subject() { return $this->belongsTo(Subject::class); }
}
