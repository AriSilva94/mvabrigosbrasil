// TODO: estado global de autenticação
export const authStore = {
  user: null as unknown,
  setUser: (user: unknown) => {
    void user;
  },
};
