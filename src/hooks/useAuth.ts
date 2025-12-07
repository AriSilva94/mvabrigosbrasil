import { useEffect, useState } from 'react';

import { getBrowserSupabaseClient } from '@/lib/supabase/clientBrowser';

type AuthUser = {
  id: string;
  email?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, isLoading, logout };
}
