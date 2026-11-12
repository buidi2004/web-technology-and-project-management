import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

export function useAsyncData<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      if (alive.current) setData(result);
    } catch (err) {
      if (alive.current) setError(getErrorMessage(err));
    } finally {
      if (alive.current) setLoading(false);
    }
    // deps do màn hình truyền vào quyết định thời điểm tải lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
