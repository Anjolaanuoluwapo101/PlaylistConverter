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
        Schema::create('conversion_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_playlist_id')->constrained('playlists')->onDelete('cascade');
            $table->enum('target_platform', ['spotify', 'youtube']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_tracks')->default(0);
            $table->integer('matched_tracks')->default(0);
            $table->integer('failed_tracks')->default(0);
            $table->integer('progress_percentage')->default(0);
            $table->string('target_playlist_id')->nullable();
            $table->text('error_message')->nullable();
            $table->longText('failed_track_details')->nullable(); //change to json in recent mysql version..check other job migrations
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversion_jobs');
    }
};
