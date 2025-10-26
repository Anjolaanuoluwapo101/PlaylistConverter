import { useState } from 'react';

export interface DataFetcherState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

export interface DataFetcherActions<T> {
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchData: (offset?: number, pageToken?: string | null, sortBy?: string, order?: string) => Promise<void>;
}

export const useDataFetcher = <T, P = Record<string, unknown>>(
  initialData: T[] = [],
  fetchFunction: (offset?: number, pageToken?: string | null, sortBy?: string, order?: string) => Promise<{ data: T[]; pagination: P }>
): [DataFetcherState<T>, DataFetcherActions<T>] => {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (offset?: number, pageToken?: string | null, sortBy?: string, order?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction(offset, pageToken, sortBy, order);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return [
    { data, isLoading, error },
    {
      setData,
      setIsLoading,
      setError,
      fetchData
    }
  ];
};
