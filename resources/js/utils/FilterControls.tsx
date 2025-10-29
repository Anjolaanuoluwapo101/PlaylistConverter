import React from 'react';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface FilterControlsProps {
  sortBy: string;
  order: 'asc' | 'desc';
  onSortByChange: (sortBy: string) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
  onApplyFilters: () => void;
  sortOptions: { value: string; label: string }[];
  isLoading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  sortBy,
  order,
  onSortByChange,
  onOrderChange,
  onApplyFilters,
  sortOptions,
  isLoading = false
}) => {
  return (
    <div className="mb-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-3 sm:p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-100 font-medium">
          <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Sort & Filter</span>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3 flex-1 justify-end">
          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-0">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="appearance-none bg-white/90 dark:bg-neutral-800/90 border border-purple-300 dark:border-purple-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 pr-8 text-purple-900 dark:text-purple-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors w-full"
              disabled={isLoading}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 pointer-events-none" />
          </div>

          {/* Order Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => onOrderChange('asc')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl border transition-colors ${
                order === 'asc'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white/90 dark:bg-neutral-800/90 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
              }`}
              disabled={isLoading}
            >
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Asc</span>
            </button>
            <button
              onClick={() => onOrderChange('desc')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl border transition-colors ${
                order === 'desc'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white/90 dark:bg-neutral-800/90 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
              }`}
              disabled={isLoading}
            >
              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Desc</span>
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={onApplyFilters}
            disabled={isLoading}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-200 to-purple-500 text-white font-semibold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span className="text-sm">Applying...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
