// TODO: implementar chamadas de autenticação
export async function login(email: string, password: string) {
  return { email, password };
}

export async function registerUser(payload: Record<string, unknown>) {
  return payload;
}
