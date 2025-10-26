# TODO: Refactor PlaylistBuilderService::buildPlaylists

## Current State
- `buildPlaylists(PlaylistBuildJob $job)` takes a job instance
- Extracts user, tracks, platforms, name, description from job
- Returns results array

## Target State
- `buildPlaylists(User $user, array $selectedTracks, array $selectedPlatforms, string $playlistName, string $playlistDescription)` 
- Takes parameters directly like `convert` and `sync` methods
- Returns results array

## Changes Needed

### 1. Refactor PlaylistBuilderService::buildPlaylists ✅ COMPLETED
- Change method signature to accept parameters
- Remove job-related logic (user extraction, etc.)
- Keep business logic (validation, grouping, platform processing)

### 2. Update BuildController::build ✅ COMPLETED
- Create job record first
- Call service with extracted parameters
- Update job with results and status

### 3. Update BuildPlaylistJob::handle ✅ COMPLETED
- Extract parameters from job instance
- Call service with parameters
- Update job status and results

## Testing ✅ IN PROGRESS
- Verify build functionality still works
- Check job status updates
- Confirm results are stored correctly
