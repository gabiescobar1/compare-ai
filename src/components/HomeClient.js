'use client'

import { useState } from 'react';
import Link from 'next/link';
import DoiForm from '@/components/DoiForm';
import ResultsComparison from '@/components/ResultsComparison';
import { IconLock, IconListDetails, IconSearch } from '@tabler/icons-react';

// Cartão que substitui o formulário enquanto o MODO AUTORA está desligado.
function GenerationLocked() {
  return (
    <div className="bg-cream dark:bg-paper-dark rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.3)] border border-stone-200 dark:border-white/8 transition-colors duration-300">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 flex-shrink-0 rounded-2xl bg-accent/10 flex items-center justify-center">
          <IconLock className="w-5 h-5 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-serif font-black text-ink dark:text-parchment tracking-tight">
            Geração de abstracts indisponível
          </h2>
          <p className="text-sm text-stone-600 dark:text-[#9a8070] mt-2 leading-relaxed">
            Os abstracts deste corpus foram gerados pela autora da pesquisa. Cada geração
            consome as APIs pagas da OpenAI, da Anthropic e do Google, por isso o formulário
            fica fechado ao público — mas todo o material já produzido está aberto para consulta.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/resultados"
              className="flex items-center justify-center gap-2 bg-accent hover:bg-gradient-to-br hover:from-accent hover:to-accent-2 text-white font-serif font-bold py-2.5 px-6 rounded-2xl shadow-sm transition-all hover:shadow-md"
            >
              <IconListDetails className="w-4 h-4" /> Ver o histórico
            </Link>
            <Link
              href="/ngramas"
              className="flex items-center justify-center gap-2 border border-stone-300 dark:border-white/10 text-ink dark:text-parchment font-serif font-bold py-2.5 px-6 rounded-2xl hover:bg-ink/5 dark:hover:bg-white/8 transition-colors"
            >
              <IconSearch className="w-4 h-4" /> Buscar n-gramas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient({ canGenerate }) {
  const [results, setResults] = useState([]);

  const handleResultAdded = (newResult) => {
    setResults(prev => [newResult, ...prev]);
  };

  const handleProcessStart = () => { };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-7xl mx-auto mb-4">
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-black leading-none tracking-tight mb-2">
          <span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-ink to-ink hover:to-[#6d4c3d] dark:from-parchment dark:to-parchment dark:hover:to-[#ffb347] transition-all duration-500 cursor-default"
          >
            Compare AI
          </span>
        </h1>
      </header>

      <main className="max-w-7xl mx-auto space-y-16">
        <div className="max-w-7xl mx-auto">
          {canGenerate ? (
            <DoiForm onResult={handleResultAdded} onProcessStart={handleProcessStart} />
          ) : (
            <GenerationLocked />
          )}
        </div>

        <div className="space-y-12">
          {results.map((res) => (
            <ResultsComparison key={res.id} data={res} canRegenerate={canGenerate} />
          ))}
        </div>
      </main>
    </div>
  );
}
