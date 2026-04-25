import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import HistoryClient from '@/components/HistoryClient';

export const revalidate = 0;

export default async function ResultadosPage() {
  const repo = new ArticleSummaryRepository();
  const analyses = await repo.getAll();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#291f1b] tracking-tight">
          Histórico Arquivado
        </h1>
      </header>

      <HistoryClient analyses={analyses} />
    </div>
  );
}
