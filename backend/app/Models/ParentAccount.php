<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class ParentAccount extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone',
        'is_verified', 'email_verification_token',
        'subscription_tier',
    ];

    protected $hidden = ['password', 'remember_token', 'email_verification_token'];

    protected $casts = [
        'is_verified'      => 'boolean',
        'subscription_tier'=> 'string',
    ];

    public function students()
    {
        return $this->belongsToMany(User::class, 'parent_student_links', 'parent_id', 'student_id')
            ->withPivot('relationship', 'is_active')
            ->wherePivot('is_active', true)
            ->withTimestamps();
    }

    public function links()
    {
        return $this->hasMany(ParentStudentLink::class, 'parent_id');
    }

    public function notifications()
    {
        return $this->hasMany(ParentNotification::class, 'parent_id')->latest();
    }
}
