# Refactoring Plan: Eliminate Duplicate Job Creation

## Goal
Move job creation to controllers and pass job IDs to services to avoid duplication in Conversion and Sync operations.

## Files to Edit
- `app/Http/Controllers/Api/ConversionController.php`
- `app/Services/Converter/PlaylistConverterService.php`
- `app/Http/Controllers/Api/SyncController.php`
- `app/Services/Converter/PlaylistSyncService.php`

## Steps
1. **ConversionController**: Move ConversionJob creation from PlaylistConverterService to the controller's convert() method.
2. **PlaylistConverterService**: Modify convert() to accept a ConversionJob instance instead of creating it.
3. **SyncController**: Ensure SyncJob is created only in controller (already done), but pass job ID to service.
4. **PlaylistSyncService**: Modify sync() to accept a SyncJob instance instead of creating it.
5. Test the refactored code to ensure functionality remains intact.
