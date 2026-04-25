'use client'
import { useState } from 'react';
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
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto mb-4">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-[#291f1b] leading-tight">
          Compare AI
        </h1>
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
