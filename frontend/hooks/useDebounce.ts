import { useState, useEffect, useCallback } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  // Initialize with value to avoid unnecessary re-renders
  const [debouncedValue, setDebouncedValue] = useState<T>(() => value);

  // Memoize the timeout callback
  const debouncedSetValue = useCallback(() => {
    setDebouncedValue(value);
  }, [value]);

  useEffect(() => {
    // Don't create timeout if delay is 0
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timeoutId = setTimeout(debouncedSetValue, delay);

    // Cleanup timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [value, delay, debouncedSetValue]);

  return debouncedValue;
}
