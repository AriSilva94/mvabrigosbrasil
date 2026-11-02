type ActionHandlers<T> = {
  onSuccess?: (value: T) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
};

export function createExclusiveAction() {
  let running = false;
  let disposed = false;
  let generation = 0;

  return {
    activate() {
      disposed = false;
      running = false;
      generation += 1;
    },
    async run<T>(operation: () => Promise<T>, handlers: ActionHandlers<T>): Promise<boolean> {
      if (running || disposed) return false;
      running = true;
      const current = ++generation;
      try {
        const value = await operation();
        if (!disposed && generation === current) handlers.onSuccess?.(value);
      } catch (error) {
        if (!disposed && generation === current) handlers.onError?.(error);
      } finally {
        if (!disposed && generation === current) {
          running = false;
          handlers.onSettled?.();
        }
      }
      return true;
    },
    dispose() {
      disposed = true;
      running = false;
      generation += 1;
    },
  };
}
