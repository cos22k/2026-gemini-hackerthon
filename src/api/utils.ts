export async function callWithRetry<T>(
  fn: () => Promise<T | null>,
  maxRetries = 2,
): Promise<T | null> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      console.error(`API call attempt ${i + 1} failed:`, e);
    }
  }
  return null;
}
