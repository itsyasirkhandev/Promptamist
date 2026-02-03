
import { useState, useCallback, useRef } from 'react';
import { withTimeout, TimeoutError } from '@/lib/timeout';

interface UseTimeoutActionOptions<T, Args extends any[]> {
  action: (...args: Args) => Promise<T>;
  timeoutMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useTimeoutAction<T, Args extends any[]>({
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
        const result = await withTimeout((signal) => {
            return action(...args);
        }, timeoutMs);
        
        setIsLoading(false);
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err: any) {
        setIsLoading(false);
        if (err instanceof TimeoutError) {
          setIsBusy(true);
        } else {
          setError(err);
          if (onError) onError(err);
        }
        throw err;
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
