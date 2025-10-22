<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaylistResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isSpotify = isset($this->resource['uri']);
        $isYoutube = isset($this->resource['kind']) && $this->resource['kind'] === 'youtube#playlist';

        if ($isSpotify) {
            return [
                'id' => $this->resource['id'],
                'name' => $this->resource['name'],
                'description' => $this->resource['description'],
                'image_url' => $this->resource['images'][0]['url'] ?? null,
                'track_count' => $this->resource['tracks']['total'],
                'platform' => 'spotify',
                'owner' => $this->resource['owner']['display_name'] ?? null,
            ];
        }

        if ($isYoutube) {
            $thumbnails = $this->resource['snippet']['thumbnails'];
            $imageUrl = $thumbnails['maxres']['url'] ?? $thumbnails['high']['url'] ?? $thumbnails['medium']['url'] ?? $thumbnails['default']['url'] ?? null;

            return [
                'id' => $this->resource['id'],
                'name' => $this->resource['snippet']['title'],
                'description' => $this->resource['snippet']['description'],
                'image_url' => $imageUrl,
                'track_count' => $this->resource['contentDetails']['itemCount'],
                'platform' => 'youtube',
                'owner' => $this->resource['snippet']['channelTitle'] ?? null,
            ];
        }

        return parent::toArray($request);
    }
}