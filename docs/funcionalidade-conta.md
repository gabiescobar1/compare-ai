# Funcionalidade de Conta (login + dados por usuário)

> **Status:** arquivada / não implementada.
> Esta página existiu como protótipo em `src/app/minha-conta/` e foi removida em 2026-06-29
> para manter a ferramenta enxuta e funcional. Este documento preserva a visão original
> e descreve como implementá-la quando/se fizer sentido.

---

## 1. Por que foi removida

A página `/minha-conta` era **100% mockup**: nome, e-mail, estatísticas e toggles fixos,
todos marcados como "em breve", sem nenhuma funcionalidade real ligada. Mantê-la no ar:

- prometia recursos que não existiam (login, sincronização em nuvem, chaves de API próprias);
- referenciava dados pessoais fixos no código (nome/e-mail hardcoded);
- confundia o guia de uso, que apontava o upload de **Lexical Bundles** para a "Minha Conta"
  quando, na prática, ele vive na página **Analytics**.

Por isso a página, o link no `Navigation` e as menções nas instruções foram retirados.

---

## 2. O que a tela previa (escopo original)

Com base no protótipo, a conta englobaria quatro blocos:

| Bloco | Conteúdo previsto |
|-------|-------------------|
| **Perfil** | Avatar, nome, e-mail, plano (ex.: "Gratuito"), botão Entrar / Criar Conta |
| **Estatísticas** | Análises realizadas, modelos utilizados, tokens consumidos, custo total estimado |
| **Chaves de API** | Campos para chaves próprias da OpenAI, Anthropic e Google |
| **Configurações / Privacidade** | Toggle "Salvar histórico de análises" e demais preferências |

---

## 3. Ponto de partida na arquitetura atual

A boa notícia: a base já existe. **O projeto já usa Supabase.**

- `src/lib/supabase.js` — cria o client a partir de
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (ou `SUPABASE_SERVICE_ROLE_KEY` no servidor).
- `src/repositories/ArticleSummaryRepository.js` — lê/grava nas tabelas
  `analyses` e `summaries`.
- **Hoje não há autenticação:** os dados são globais (qualquer visitante vê tudo).
- **Lexical Bundles** ficam apenas em `localStorage`
  (`src/contexts/LexicalBundlesContext.js`, chave `lexicalBundles`) — não estão por usuário.

Implementar conta = adicionar **Supabase Auth** + vincular os dados existentes a um `user_id`.

---

## 4. Roteiro de implementação sugerido

### 4.1 Autenticação (Supabase Auth)
1. Habilitar o provedor desejado no painel do Supabase (e-mail/senha, magic link, ou OAuth Google).
2. Criar páginas/fluxos de **login**, **cadastro** e **logout**.
3. Envolver o app num `AuthContext` (similar ao `LexicalBundlesContext`) expondo
   `user`, `session`, `signIn`, `signOut`. Usar `supabase.auth.onAuthStateChange`.
4. Substituir o avatar "GE" e o e-mail hardcoded pelos dados reais de `user`.

### 4.2 Dados por usuário (Row Level Security)
1. Adicionar coluna `user_id uuid references auth.users(id)` em `analyses`
   (os `summaries` herdam via `analysis_id`).
2. Ativar **RLS** e criar policies: cada usuário só lê/escreve as próprias linhas.
   ```sql
   alter table analyses enable row level security;
   create policy "own analyses" on analyses
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```
3. Ajustar `ArticleSummaryRepository.save/getAll/delete` para incluir/filtrar por `user_id`.
4. **Migração:** decidir o que fazer com os dados globais atuais (descartar, ou atribuir a um usuário).

### 4.3 Migrar Lexical Bundles para a nuvem (opcional)
1. Criar tabela `lexical_bundles (user_id, discipline, bundle, created_at)`.
2. No login, mesclar o que estiver em `localStorage` com o que está no Supabase
   (offline-first: localStorage continua sendo o cache).
3. Manter compatibilidade para usuários **sem conta** (fluxo atual via localStorage).

### 4.4 Estatísticas reais
As métricas do protótipo já podem ser calculadas a partir de `summaries`:
- **Análises realizadas** → `count` de `analyses` do usuário.
- **Modelos utilizados** → `distinct model_id` em `summaries`.
- **Tokens consumidos** → `sum(input_tokens + output_tokens)`.
- **Custo total estimado** → `sum(cost)`.

Boa parte dessa agregação já existe na página **Analytics**
(`src/components/AnalyticsClient.js`) — reaproveitar de lá, filtrando por `user_id`.

### 4.5 Chaves de API próprias (sensível — tratar com cuidado)
- **Nunca** expor chaves de usuário no client nem em `NEXT_PUBLIC_*`.
- Armazenar criptografadas no servidor e usar **somente** em rotas/Server Actions.
- Hoje a chamada às IAs está em `src/services/AIService.js`; ela precisaria aceitar
  a chave do usuário em vez da chave global do ambiente.
- Considerar `supabase.vault` ou criptografia em coluna dedicada + RLS estrita.

---

## 5. Onde isso reconecta na UI

Se a conta voltar, será preciso:
- Recriar `src/app/minha-conta/page.js` (o protótipo está no histórico do git, commit anterior a 2026-06-29).
- Re-adicionar o link no `src/components/Navigation.js` (havia um botão "Minha Conta" com avatar à direita, antes do `ThemeToggle`).
- Reintroduzir nas instruções (`src/app/instrucoes/page.js`) o "Passo 0: Configurar Chaves de API"
  e a menção a login/sincronização — que foram removidos junto com a página.

---

## 6. Resumo de uma linha

> A conta é, na prática, **Supabase Auth + `user_id`/RLS sobre tabelas que já existem**, mais
> migração dos Lexical Bundles do `localStorage` e armazenamento seguro de chaves de API.
> Nada disso é necessário para a ferramenta funcionar hoje — é evolução futura.
