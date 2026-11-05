-- ============================================================
-- TRANCAR O BANCO DE DADOS CONTRA ACESSO DIRETO
-- ============================================================
--
-- Rode TUDO de uma vez: clique no editor, selecione todo o texto
-- (Ctrl+A) e clique em Run. Rodar só um pedaço não funciona.
--
-- POR QUE:
-- A chave "sb_publishable_" é pública. Sem o que está abaixo, ela permite
-- ler, criar, editar e apagar as análises direto no banco, sem passar pelo
-- site. Isso foi testado e confirmado nesta base.
--
-- POR QUE A PRIMEIRA VERSÃO DESTE ARQUIVO NÃO BASTOU:
-- Ligar o "Row Level Security" (RLS) não fecha nada se a tabela já tiver
-- políticas liberando o acesso — e esta tinha. É preciso remover as
-- políticas antigas também. Com o RLS ligado e ZERO políticas, o banco
-- recusa todo acesso feito com a chave pública.
--
-- POR QUE O SITE CONTINUA FUNCIONANDO:
-- O site nunca consulta estas tabelas pelo navegador. Quem lê e escreve é o
-- servidor, com a SUPABASE_SERVICE_ROLE_KEY (sb_secret_), que passa por cima
-- do RLS por definição. Ou seja: o site segue funcionando, e só ele consegue.
--
-- ============================================================


-- PASSO 1 — o que existe hoje, antes de mexer.
-- (Se vier vazio, não havia políticas e o problema é outro: me avise.)
select tablename, policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
   and tablename in ('analyses', 'summaries');


-- PASSO 2 — remove TODAS as políticas abertas dessas duas tabelas.
do $$
declare p record;
begin
  for p in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('analyses', 'summaries')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice 'politica removida: % (tabela %)', p.policyname, p.tablename;
  end loop;
end $$;


-- PASSO 3 — garante a tranca ligada (já estava, mas não custa repetir).
alter table public.analyses  enable row level security;
alter table public.summaries enable row level security;


-- PASSO 4 — CONFERÊNCIA. O resultado esperado é exatamente:
--   total_de_analises = 160
--   politicas_abertas = 0
--   tranca_ligada     = true
--
-- Se total_de_analises não for 160, você está em OUTRO projeto do Supabase —
-- o certo é o de ref "usmbvmnhrurnyjdluahu".
select
  (select count(*) from public.analyses) as total_de_analises,
  (select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in ('analyses', 'summaries')) as politicas_abertas,
  (select bool_and(rowsecurity) from pg_tables
    where schemaname = 'public'
      and tablename in ('analyses', 'summaries')) as tranca_ligada;
