'use client'
import { useState } from 'react';
import DoiForm from '@/components/DoiForm';
import ResultsComparison from '@/components/ResultsComparison';
import { IconBook2 } from '@tabler/icons-react';

export default function Home() {
  const [results, setResults] = useState([]);

  const handleResultAdded = (newResult) => {
    setResults(prev => [newResult, ...prev]);
  };

  const handleProcessStart = () => {};

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-bold tracking-widest uppercase shadow-sm">
          <IconBook2 className="w-4 h-4" /> Comparador Acadêmico
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 text-slate-900 leading-tight">
          Sintetize Artigos do Plos One <br/> com Inteligência Artificial
        </h1>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl leading-relaxed">
          Forneça seus DOIs abaixo. Nossa arquitetura executará um parsing direto na formatação acadêmica e orquestrará a comparação de resumos estruturados.
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-16">
        <div className="max-w-4xl mx-auto">
           <DoiForm onResult={handleResultAdded} onProcessStart={handleProcessStart} />
        </div>

        <div className="space-y-12">
          {results.map((res) => (
            <ResultsComparison key={res.id} data={res} />
          ))}
        </div>
      </main>
    </div>
  );
}
