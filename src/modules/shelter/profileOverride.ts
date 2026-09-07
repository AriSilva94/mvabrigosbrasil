export type ProfileOverride<T> = {
  profileRevision: number;
  value: T;
} | null;

export function resolveProfileOverride<T>(
  override: ProfileOverride<T>,
  profileRevision: number,
  fallback: T,
): T {
  return override?.profileRevision === profileRevision
    ? override.value
    : fallback;
}

export function publishShelterProfile<T>(revision: number, shelter: T) {
  return {
    shelter,
    revision: revision + 1,
  };
}
