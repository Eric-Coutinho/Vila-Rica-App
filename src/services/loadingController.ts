type LoadingListener = (visible: boolean) => void;

let activeRequests = 0;
let listener: LoadingListener | null = null;

export function subscribeLoading(nextListener: LoadingListener): () => void {
  listener = nextListener;
  listener(activeRequests > 0);
  return () => {
    if (listener === nextListener) listener = null;
  };
}

export function beginLoading(): () => void {
  activeRequests += 1;
  listener?.(true);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeRequests = Math.max(0, activeRequests - 1);
    listener?.(activeRequests > 0);
  };
}

export async function withLoading<T>(task: () => Promise<T>): Promise<T> {
  const end = beginLoading();
  try {
    return await task();
  } finally {
    end();
  }
}
