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
        Schema::create('tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
            $table->string('source_track_id');
            $table->string('title');
            $table->string('artist');
            $table->string('album')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
            
            $table->index('playlist_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracks');
    }
};
