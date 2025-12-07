import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Aplica o proxy em todas as rotas exceto assets estáticos e imagens.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
