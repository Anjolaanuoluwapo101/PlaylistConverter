import { useState } from 'react';

export interface PaginationState {
  offset: number;
  pageToken: string | null;
  prevPageToken: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
  total: number;
}

export interface PaginationActions {
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
  resetPagination: () => void;
}

export const usePagination = (
  platformId: string,
  fetchData: (offset?: number, pageToken?: string | null) => void
): [PaginationState, PaginationActions] => {
  const [pagination, setPagination] = useState<PaginationState>({
    offset: 0,
    pageToken: null,
    prevPageToken: null,
    hasMore: false,
    hasPrevious: false,
    total: 0
  });

  const loadNextPage = () => {
    if (platformId === 'spotify' && pagination.offset !== null) {
      fetchData(pagination.offset + 20);
    } else if (platformId === 'youtube' && pagination.pageToken) {
      fetchData(undefined, pagination.pageToken);
    }
  };

  const loadPreviousPage = () => {
    if (platformId === 'spotify' && pagination.offset !== null && pagination.offset > 0) {
      fetchData(Math.max(0, pagination.offset - 20));
    } else if (platformId === 'youtube' && pagination.prevPageToken) {
      fetchData(undefined, pagination.prevPageToken);
    }
  };

  const resetPagination = () => {
    setPagination({
      offset: 0,
      pageToken: null,
      prevPageToken: null,
      hasMore: false,
      hasPrevious: false,
      total: 0
    });
  };

  return [
    pagination,
    {
      setPagination,
      loadNextPage,
      loadPreviousPage,
      resetPagination
    }
  ];
};
