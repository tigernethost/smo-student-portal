<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ParentNotification extends Model
{
    protected $fillable = ['parent_id','student_id','type','title','body','data','is_read'];
    protected $casts    = ['data' => 'array', 'is_read' => 'boolean'];

    public function student() { return $this->belongsTo(User::class, 'student_id'); }
}
