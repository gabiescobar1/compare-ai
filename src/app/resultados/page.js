import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import ResultsComparison from '@/components/ResultsComparison';
import { IconBook } from '@tabler/icons-react';

export const revalidate = 0; 

export default async function ResultadosPage() {
  const repo = new ArticleSummaryRepository();
  const analyses = await repo.getAll();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-bold tracking-widest uppercase shadow-sm">
          <IconBook className="w-4 h-4" /> Relatórios
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 text-slate-900 tracking-tight">
          Histórico Arquivado
        </h1>
        <p className="text-slate-600 text-lg">
          Compilação das submissões e análises previamente submetidas à infraestrutura de IAs.
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {analyses.length === 0 ? (
           <div className="text-center border border-slate-200 bg-white rounded p-12 text-slate-500 font-medium max-w-2xl mx-auto shadow-sm">
              <IconBook className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              Não existem registros acadêmicos no banco de dados. <br/>Acesse a interface principal para inicializar um processamento.
           </div>
        ) : (
           analyses.map(item => (
              <ResultsComparison key={item.id} data={item} />
           ))
        )}
      </main>
    </div>
  );
}
