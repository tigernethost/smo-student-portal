<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password',
        'avatar_url', 'social_provider',
        'grade_level', 'strand', 'school_name', 'learning_goal', 'learning_challenge', 'learning_style',
        'onboarding_done', 'role',
        'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'onboarding_done'   => 'boolean',
    ];
}
