export type ProfileOverride<T> = {
  profileKey: string;
  value: T;
} | null;

export function resolveProfileOverride<T>(
  override: ProfileOverride<T>,
  profileKey: string,
  fallback: T,
): T {
  return override?.profileKey === profileKey ? override.value : fallback;
}
