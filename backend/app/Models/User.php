<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
        'is_admin',
        'avatar_url', 'grade_level', 'strand', 'school_name',
        'social_provider', 'social_id',
        'learning_style', 'primary_goal', 'biggest_challenge',
        'onboarding_done',
        'plan', 'ai_quota_used', 'ai_quota_limit', 'ai_quota_reset_at',
        'parent_payment_token',
        'parent_link_code',
        'created_by_parent',
        'created_by_parent_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'onboarding_done'   => 'boolean',
        'is_admin'          => 'boolean',
        'created_by_parent' => 'boolean',
        'ai_quota_used'     => 'integer',
        'ai_quota_limit'    => 'integer',
        'ai_quota_reset_at' => 'datetime',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin === true;
    }

    public function enrolledSubjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects', 'user_id', 'subject_id');
    }

    public function topicMasteries()
    {
        return $this->hasMany(StudentTopicMastery::class);
    }

    public function quizSessions()
    {
        return $this->hasMany(QuizSession::class);
    }

    public function uploads()
    {
        return $this->hasMany(StudentUpload::class);
    }

    public function parents()
    {
        return $this->belongsToMany(ParentAccount::class, 'parent_student_links', 'student_id', 'parent_id')
            ->withPivot('relationship', 'is_active')
            ->wherePivot('is_active', true)
            ->withTimestamps();
    }

    public function generateParentLinkCode(): string
    {
        if (!$this->parent_link_code) {
            $code = strtoupper(substr(str_replace(['+','/','='],'', base64_encode(random_bytes(8))), 0, 8));
            $this->update(['parent_link_code' => $code]);
        }
        return $this->parent_link_code;
    }
}
