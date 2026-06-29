'use client'
import { useState } from 'react';
import Link from 'next/link';
import DoiForm from '@/components/DoiForm';
import ResultsComparison from '@/components/ResultsComparison';

export default function Home() {
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
