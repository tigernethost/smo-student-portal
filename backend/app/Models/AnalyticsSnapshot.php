<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AnalyticsSnapshot extends Model {
    protected $fillable = ['user_id','overall_score','subject_scores','strengths','weaknesses','at_risk_topics','recommended_topics','total_quizzes','total_uploads','risk_level','ai_summary'];
    protected $casts = ['subject_scores'=>'array','strengths'=>'array','weaknesses'=>'array','at_risk_topics'=>'array','recommended_topics'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
}
