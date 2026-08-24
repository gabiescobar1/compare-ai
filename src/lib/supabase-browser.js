import { createBrowserClient } from '@supabase/ssr';

// Cliente Supabase para o navegador (login/logout). Guarda a sessão em cookie,
// que o servidor/proxy consegue ler.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
