export type DynamicsOperationFlags = {
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
};

type DynamicsOperationKind = "get" | "save" | "delete";

type DynamicsOperationHandlers<T> = {
  onSuccess: (value: T) => void;
  onError: (error: unknown) => void;
  onSettled: () => void;
};

type DynamicsOperationCoordinatorOptions = {
  setFlags: (flags: DynamicsOperationFlags) => void;
};

const IDLE_FLAGS: DynamicsOperationFlags = {
  isLoading: false,
  isSaving: false,
  isDeleting: false,
};

const flagsFor = (kind: DynamicsOperationKind): DynamicsOperationFlags => ({
  isLoading: kind === "get",
  isSaving: kind === "save",
  isDeleting: kind === "delete",
});

export function createDynamicsOperationCoordinator({
  setFlags,
}: DynamicsOperationCoordinatorOptions) {
  let generation = 0;
  let disposed = false;

  const isCurrent = (operationGeneration: number): boolean =>
    !disposed && operationGeneration === generation;

  return {
    activate(): void {
      disposed = false;
    },

    invalidateContext(): void {
      generation += 1;
      if (!disposed) setFlags(IDLE_FLAGS);
    },

    dispose(): void {
      generation += 1;
      disposed = true;
    },

    async run<T>(
      kind: DynamicsOperationKind,
      operation: () => Promise<T>,
      handlers: DynamicsOperationHandlers<T>,
    ): Promise<void> {
      if (disposed) return;

      const operationGeneration = ++generation;
      setFlags(flagsFor(kind));

      try {
        const value = await operation();
        if (isCurrent(operationGeneration)) handlers.onSuccess(value);
      } catch (error) {
        if (isCurrent(operationGeneration)) handlers.onError(error);
      } finally {
        if (isCurrent(operationGeneration)) {
          setFlags(IDLE_FLAGS);
          handlers.onSettled();
        }
      }
    },
  };
}
