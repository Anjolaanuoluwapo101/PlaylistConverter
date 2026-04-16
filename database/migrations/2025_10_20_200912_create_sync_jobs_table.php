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
        Schema::create('sync_jobs', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('source_playlist_id');
            $table->string('source_platform');
            $table->string('target_playlist_id');
            $table->string('target_platform');
            $table->boolean('remove_extras')->default(false);
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->integer('tracks_to_add')->default(0);
            $table->integer('tracks_to_remove')->default(0);
            $table->integer('tracks_in_sync')->default(0);
            $table->integer('added_count')->default(0);
            $table->integer('removed_count')->default(0);
            $table->integer('failed_to_add_count')->default(0);
            $table->integer('failed_to_remove_count')->default(0);
            $table->integer('progress_percentage')->default(0);
            $table->json('results')->nullable();
            $table->text('error_message')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_jobs');
    }
};
