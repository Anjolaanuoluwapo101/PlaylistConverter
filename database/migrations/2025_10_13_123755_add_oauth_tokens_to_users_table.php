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
        Schema::table('users', function (Blueprint $table) {
            $table->text('spotify_access_token')->nullable();
            $table->text('spotify_refresh_token')->nullable();
            $table->timestamp('spotify_token_expires_at')->nullable();
            
            $table->text('youtube_access_token')->nullable();
            $table->text('youtube_refresh_token')->nullable();
            $table->timestamp('youtube_token_expires_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'spotify_access_token',
                'spotify_refresh_token',
                'spotify_token_expires_at',
                'youtube_access_token',
                'youtube_refresh_token',
                'youtube_token_expires_at',
            ]);
        });
    }
};
