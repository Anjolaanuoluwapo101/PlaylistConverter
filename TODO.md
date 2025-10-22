# Sync Method Refactoring Plan

## Current Issues
- PlaylistSyncService::sync() performs operations synchronously without job tracking
- SyncJob model is empty and migration lacks proper fields
- No separation between job creation and execution like in PlaylistConverterService

## Plan
1. **Update SyncJob Model and Migration**
   - Add proper fields to SyncJob model (similar to ConversionJob)
   - Update sync_jobs migration with required columns

2. **Refactor PlaylistSyncService**
   - Create sync() method that creates SyncJob and calls performSyncing()
   - Rename current sync() logic to performSyncing()
   - Add job status tracking and progress updates

3. **Update SyncController**
   - Modify to work with new sync job structure
   - Add job status retrieval methods

4. **Update SyncPlaylistJob**
   - Change to call performSyncing() instead of sync()

5. **Testing**
   - Verify sync job creation and execution
   - Test both queued and immediate sync modes

## Files to Modify
- app/Models/SyncJob.php
- database/migrations/2025_10_20_200912_create_sync_jobs_table.php
- app/Services/Converter/PlaylistSyncService.php
- app/Http/Controllers/Api/SyncController.php
- app/Jobs/SyncPlaylistJob.php
