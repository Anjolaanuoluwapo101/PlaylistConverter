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
    <div className="mb-4 bg-white border border-gray-200 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-black font-medium">
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort & Filter</span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1 justify-end">
          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-0">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 px-3 py-2 pr-8 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              disabled={isLoading}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Order Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => onOrderChange('asc')}
              className={`flex items-center gap-1 px-3 py-2 border transition-colors ${
                order === 'asc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              disabled={isLoading}
            >
              <ArrowUp className="w-4 h-4" />
              <span className="hidden sm:inline">Asc</span>
            </button>
            <button
              onClick={() => onOrderChange('desc')}
              className={`flex items-center gap-1 px-3 py-2 border transition-colors ${
                order === 'desc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              disabled={isLoading}
            >
              <ArrowDown className="w-4 h-4" />
              <span className="hidden sm:inline">Desc</span>
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={onApplyFilters}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
                <span>Applying...</span>
              </div>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;