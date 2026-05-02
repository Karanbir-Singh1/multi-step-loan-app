import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const getErrorMessage = (error) =>
  error.response?.data?.details?.[0] || error.response?.data?.message || error.message || 'Something went wrong';

export const useAsync = (fn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fn();
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run, setData };
};
