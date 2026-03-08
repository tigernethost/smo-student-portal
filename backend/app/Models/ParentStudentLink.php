<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ParentStudentLink extends Model
{
    protected $fillable = ['parent_id','student_id','relationship','link_code','is_active'];
    protected $casts    = ['is_active' => 'boolean'];

    public function parent()   { return $this->belongsTo(ParentAccount::class, 'parent_id'); }
    public function student()  { return $this->belongsTo(User::class, 'student_id'); }
}
