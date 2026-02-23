<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    protected $fillable = [
        'name',
        'city',
        'abbreviation',
        'logo_url',
        'conference',
        'division',
        'founded_year',
        'arena',
        'description',
    ];

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_followers')
                    ->withPivot('notifications_enabled')
                    ->withTimestamps();
    }

    public function followersCount(): int
    {
        return $this->followers()->count();
    }
}
