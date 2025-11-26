<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('team_followers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('team_api_id'); // ID da equipa da API (ex: "lal", "bos", etc)
            $table->boolean('notifications_enabled')->default(true);
            $table->timestamps();

            // Prevent duplicate follows
            $table->unique(['user_id', 'team_api_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_followers');
    }
};
