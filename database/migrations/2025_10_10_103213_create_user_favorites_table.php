<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('favoritable_type'); // 'team' ou 'player'
            $table->integer('favoritable_id'); // ID da API
            $table->string('favoritable_name');
            $table->json('metadata')->nullable(); // logo, stats extras, etc.
            $table->timestamps();

            $table->unique(['user_id', 'favoritable_type', 'favoritable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_favorites');
    }
};
