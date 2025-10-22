<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ResponseCache
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $minutes = 60): Response
    {
        // Create a unique cache key based on the request
        $key = $this->makeCacheKey($request);

        // Check if response is cached
        if (Cache::has($key)) {
            $cachedResponse = Cache::get($key);
            return $cachedResponse;
        }

        // Get the response
        $response = $next($request);

        // Cache the response if it's successful
        if ($response->getStatusCode() === 200) {
            Cache::put($key, $response, now()->addMinutes($minutes));
        }

        return $response;
    }

    /**
     * Generate a unique cache key for the request.
     */
    protected function makeCacheKey(Request $request): string
    {
        return 'response_cache_' . md5(
            $request->fullUrl() .
            $request->method() .
            serialize($request->all()) .
            ($request->user() ? $request->user()->id : 'guest')
        );
    }
}
