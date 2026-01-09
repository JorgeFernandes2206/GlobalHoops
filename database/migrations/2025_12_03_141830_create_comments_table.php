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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('commentable_type'); // Type: Game, Topic, etc
            $table->string('commentable_id'); // ID as string to support "nba_401810179" format for games
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade'); // Para replies
            $table->text('content');
            $table->timestamps();
            
            $table->index(['commentable_id', 'commentable_type']);
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
