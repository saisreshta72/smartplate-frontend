import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fn = useCallback(
    async (...args) => {
      if (!isMountedRef.current) return;
      setLoading(true);
      setError(null);

      try {
        const response = await cb(...args);
        if (isMountedRef.current) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
          toast.error(err.message || "An error occurred");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cb]
  );

  return { data, loading, error, fn, setData };
};

export default useFetch;