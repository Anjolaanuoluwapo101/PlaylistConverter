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
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('source_platform', ['spotify', 'youtube']);
            $table->string('source_playlist_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('track_count')->default(0);
            $table->string('image_url')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'source_platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlists');
    }
};
