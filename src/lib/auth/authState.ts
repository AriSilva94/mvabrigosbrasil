export type AuthStateSnapshot<T> = {
  user: T | null;
  isLoading: boolean;
};

type ActiveLoad<T> = {
  promise: Promise<T | null>;
};

export function createAuthStateCoordinator<T>(
  requestUser: () => Promise<T>,
) {
  let snapshot: AuthStateSnapshot<T> = { user: null, isLoading: true };
  let generation = 0;
  let hasCachedResult = false;
  let isLoggingOut = false;
  let activeLoad: ActiveLoad<T> | null = null;
  const listeners = new Set<() => void>();

  function publish(next: AuthStateSnapshot<T>): void {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function requestUserSafely(): Promise<T> {
    try {
      return requestUser();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function startLoad(force: boolean): Promise<T | null> {
    if (isLoggingOut) return Promise.resolve(snapshot.user);

    if (!force) {
      if (hasCachedResult) return Promise.resolve(snapshot.user);
      if (activeLoad) return activeLoad.promise;

      if (!snapshot.isLoading) {
        publish({ user: snapshot.user, isLoading: true });
      }
    } else {
      generation += 1;
    }

    const loadGeneration = generation;
    const promise = requestUserSafely()
      .then((user) => {
        if (loadGeneration === generation && !isLoggingOut) {
          hasCachedResult = true;
          publish({ user, isLoading: false });
        }
        return user;
      })
      .catch(() => {
        if (loadGeneration === generation && !isLoggingOut) {
          hasCachedResult = false;
          publish({ user: null, isLoading: false });
        }
        return null;
      })
      .finally(() => {
        if (activeLoad?.promise === promise) {
          activeLoad = null;
        }
      });

    activeLoad = { promise };
    return promise;
  }

  async function logout(requestLogout: () => Promise<unknown>): Promise<void> {
    generation += 1;
    activeLoad = null;
    isLoggingOut = true;

    try {
      await requestLogout();
    } finally {
      generation += 1;
      activeLoad = null;
      hasCachedResult = true;
      isLoggingOut = false;
      publish({ user: null, isLoading: false });
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load: () => startLoad(false),
    refresh: () => startLoad(true),
    logout,
  };
}
