// TODO: configurar cliente HTTP (fetch/axios)
export async function apiClient<TResponse>(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  return response.json() as Promise<TResponse>;
}
