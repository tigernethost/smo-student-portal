<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StudentUpload extends Model {
    protected $fillable = ['user_id','subject_id','type','file_url','file_name','original_name','status','ai_result','extracted_score','extracted_total','extracted_subject','extracted_quarter','weak_topics','ai_summary'];
    protected $casts = ['ai_result'=>'array','weak_topics'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
}
