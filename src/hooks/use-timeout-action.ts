
import { useState, useCallback, useRef } from 'react';
import { withTimeout, TimeoutError } from '@/lib/timeout';

interface UseTimeoutActionOptions<T, Args extends unknown[]> {
  action: (...args: Args) => Promise<T>;
  timeoutMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useTimeoutAction<T, Args extends unknown[]>({
  action,
  timeoutMs = 3500,
  onSuccess,
  onError,
}: UseTimeoutActionOptions<T, Args>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastArgs = useRef<Args | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      lastArgs.current = args;
      setIsLoading(true);
      setIsBusy(false);
      setError(null);

      try {
        const result = await withTimeout(() => {
            return action(...args);
        }, timeoutMs);
        
        setIsLoading(false);
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err: unknown) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error(String(err));
        if (error instanceof TimeoutError) {
          setIsBusy(true);
        } else {
          setError(error);
          if (onError) onError(error);
        }
        throw error;
      }
    },
    [action, timeoutMs, onSuccess, onError]
  );

  const retry = useCallback(() => {
    if (lastArgs.current) {
      return execute(...lastArgs.current);
    }
  }, [execute]);

  return {
    execute,
    retry,
    isLoading,
    isBusy,
    error,
    reset: () => {
        setIsBusy(false);
        setIsLoading(false);
        setError(null);
    }
  };
}
