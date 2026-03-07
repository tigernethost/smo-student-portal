<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Subject extends Model {
    protected $fillable = ['name','code','icon','color','grade_level','track','is_active'];
    public function topics() { return $this->hasMany(Topic::class); }
    public function studentSubjects() { return $this->hasMany(StudentSubject::class); }
}
