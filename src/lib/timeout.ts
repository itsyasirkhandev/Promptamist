
/**
 * Custom error class for timeout errors
 */
export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout and AbortController support.
 * 
 * @param promiseFn A function that returns a promise and takes an AbortSignal
 * @param timeoutMs Timeout in milliseconds (default 3500)
 * @returns The result of the promise
 */
export async function withTimeout<T>(
  promiseFn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = 3500
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await promiseFn(controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Server is busy, request took longer than ${timeoutMs}ms`);
    }
    throw error;
  }
}
