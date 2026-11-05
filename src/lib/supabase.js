import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Só a chave de serviço serve aqui. Ela é privada (nunca chega ao navegador) e
// passa por cima do RLS — é assim que o site lê e grava as análises enquanto o
// banco recusa qualquer acesso direto feito com a chave anon, que é pública.
// Ver docs/travar-banco.sql.
//
// Havia aqui um fallback para a chave anon. Foi removido de propósito: com o
// RLS ligado, o fallback não daria erro nenhum — devolveria um site vazio, que
// é bem mais difícil de entender do que uma mensagem clara.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY não configurada: o site não vai conseguir ler nem gravar análises. ' +
    'Localmente, confira o .env.local; em produção, configure-a nas variáveis de ambiente da hospedagem.'
  );
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
