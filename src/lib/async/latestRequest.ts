export class LatestRequest {
  private generation = 0;

  begin(): number {
    this.generation += 1;
    return this.generation;
  }

  invalidate(): void {
    this.generation += 1;
  }

  isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  async run<T>(
    operation: () => Promise<T>,
    handlers: {
      onSuccess: (value: T) => void;
      onError?: (error: unknown) => void;
      onSettled?: () => void;
    },
  ): Promise<T | undefined> {
    const generation = this.begin();
    try {
      const value = await operation();
      if (!this.isCurrent(generation)) return undefined;
      handlers.onSuccess(value);
      return value;
    } catch (error) {
      if (this.isCurrent(generation)) handlers.onError?.(error);
      return undefined;
    } finally {
      if (this.isCurrent(generation)) handlers.onSettled?.();
    }
  }
}

export class LatestRequestScope {
  readonly requests = new LatestRequest();

  dispose(): void {
    this.requests.invalidate();
  }
}
