# Refactor History Sections to Use Modular JobHistory Component

## Tasks
- [ ] Update Build.tsx to use JobHistory component with custom renderItem for BuildJob
- [ ] Update Convert.tsx to use JobHistory component with custom renderItem for ConversionJob
- [ ] Update Sync.tsx to use JobHistory component with custom renderItem for SyncJob
- [ ] Test the changes to ensure history displays correctly in all three pages

## Information Gathered
- JobHistory.tsx is a reusable component that accepts title, jobs array, and renderItem function
- Build.tsx has inline "Build Jobs History" section rendering BuildJob objects
- Convert.tsx has inline "Conversion History" section rendering ConversionJob objects
- Sync.tsx has inline "Sync History" section rendering SyncJob objects
- Each job type has different fields, so renderItem functions need to be customized

## Plan
- Replace inline history sections in each page with <JobHistory> component
- Create renderItem functions that match the existing rendering logic for each job type
- Ensure styling and functionality remain consistent

## Dependent Files
- PlaylistConverter/resources/js/pages/Build.tsx
- PlaylistConverter/resources/js/pages/Convert.tsx
- PlaylistConverter/resources/js/pages/Sync.tsx
