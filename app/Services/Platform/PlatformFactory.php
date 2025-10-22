<?php

namespace App\Services\Platform;

use Illuminate\Support\Facades\Log;

class PlatformFactory
{
    private array $platforms = [];

    public function __construct(
        SpotifyPlatform $spotify,
        YouTubePlatform $youtube
    ) {
        $this->platforms = [
            'spotify' => $spotify,
            'youtube' => $youtube,
        ];

        Log::info("PlatformFactory initialized", [
            'available_platforms' => array_keys($this->platforms)
        ]);
    }

    /**
     * Get platform instance by name
     */
    public function make(string $platformName): PlatformInterface
    {
        Log::info("Requesting platform", ['platform' => $platformName]);

        if (!isset($this->platforms[$platformName])) {
            Log::error("Unknown platform requested", [
                'platform' => $platformName,
                'available' => array_keys($this->platforms)
            ]);
            throw new \InvalidArgumentException("Unknown platform: {$platformName}");
        }

        return $this->platforms[$platformName];
    }

    /**
     * Get all available platforms
     */
    public function getAvailablePlatforms(): array
    {
        return array_keys($this->platforms);
    }

    /**
     * Check if platform is supported
     */
    public function isSupported(string $platformName): bool
    {
        return isset($this->platforms[$platformName]);
    }

    /**
     * Register a new platform (for future extensibility)
     */
    public function register(string $name, PlatformInterface $platform): void
    {
        Log::info("Registering new platform", ['platform' => $name]);
        $this->platforms[$name] = $platform;
    }
}