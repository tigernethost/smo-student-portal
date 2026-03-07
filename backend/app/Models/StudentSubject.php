<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentSubject extends Model {
    protected $fillable = ['user_id','subject_id','school_year','quarter','is_active'];
    public function subject() { return $this->belongsTo(Subject::class); }
    public function user() { return $this->belongsTo(User::class); }
}
