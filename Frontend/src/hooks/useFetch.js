import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useFetch — generic data-fetching hook
 * @param {Function} fetchFn — an async function that returns response
 * @param {Array} deps — dependency array (re-fetch when changed)
 * @param {Object} options — { immediate: bool, params: object }
 */
export default function useFetch(fetchFn, deps = [], options = {}) {
  const { immediate = true, params } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(
    async (overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchFn(overrideParams ?? params);
        if (mountedRef.current) setData(res.data);
      } catch (err) {
        if (mountedRef.current)
          setError(err.response?.data?.message || err.message || "An error occurred");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
