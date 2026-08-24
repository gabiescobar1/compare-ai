'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { IconLock, IconLoader2, IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('E-mail ou senha incorretos.');
      setPending(false);
      return;
    }

    // Recarrega de fato para o proxy enxergar o cookie de sessão.
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-cream dark:bg-paper-dark">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-cream dark:bg-paper-dark rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.3)] border border-stone-200 dark:border-white/8"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
            <IconLock className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-serif font-black text-ink dark:text-parchment">Compare AI</h1>
          <p className="text-sm text-stone-500 dark:text-[#9a8070] mt-1">Acesso restrito</p>
        </div>

        <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold mb-2">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
          placeholder="voce@email.com"
          className="w-full bg-cream dark:bg-paper-dark text-stone-800 dark:text-parchment border border-stone-300 dark:border-white/10 rounded-2xl p-3 mb-4 focus:ring-2 focus:ring-accent focus:outline-none transition shadow-sm font-medium placeholder-stone-400 dark:placeholder-[#8a7058]"
        />

        <label className="block text-stone-700 dark:text-[#c4b09a] text-sm font-bold mb-2">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-cream dark:bg-paper-dark text-stone-800 dark:text-parchment border border-stone-300 dark:border-white/10 rounded-2xl p-3 focus:ring-2 focus:ring-accent focus:outline-none transition shadow-sm font-medium placeholder-stone-400 dark:placeholder-[#8a7058]"
        />

        {error && (
          <div className="flex items-center text-red-700 dark:text-red-400 mt-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-2.5 rounded-xl">
            <IconAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-accent hover:bg-gradient-to-br hover:from-accent hover:to-accent-2 text-white font-serif font-bold py-3 px-6 rounded-2xl shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? <IconLoader2 className="animate-spin w-5 h-5" /> : <IconLock className="w-5 h-5" />}
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
