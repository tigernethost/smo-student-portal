<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Notification extends Model {
    protected $fillable = ['user_id','type','title','message','icon','link','is_read','meta'];
    protected $casts = ['meta'=>'array','is_read'=>'boolean'];
}
