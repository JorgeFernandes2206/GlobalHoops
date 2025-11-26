<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the team followers records
     */
    public function teamFollowers()
    {
        return $this->hasMany(TeamFollower::class);
    }

    /**
     * Check if user follows a specific team by API ID
     */
    public function followsTeam($teamApiId): bool
    {
        return $this->teamFollowers()->where('team_api_id', $teamApiId)->exists();
    }

    /**
     * Get list of followed team API IDs
     */
    public function followedTeamIds(): array
    {
        return $this->teamFollowers()->pluck('team_api_id')->toArray();
    }
}
