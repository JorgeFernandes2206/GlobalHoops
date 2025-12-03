<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'is_pinned',
        'is_locked',
        'views',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'views' => 'integer',
    ];

    protected $with = ['user'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'commentable_id')
            ->where('commentable_type', 'Topic')
            ->whereNull('parent_id')
            ->latest();
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function commentCount(): int
    {
        return Comment::where('commentable_type', 'Topic')
            ->where('commentable_id', $this->id)
            ->count();
    }

    public function latestComment()
    {
        return Comment::where('commentable_type', 'Topic')
            ->where('commentable_id', $this->id)
            ->latest()
            ->first();
    }
}
