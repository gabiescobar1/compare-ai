import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import NgramSearch from '@/components/NgramSearch';

export const revalidate = 0;

export const metadata = {
  title: 'N-gramas — Compare AI',
  description: 'Busca de sequências recorrentes de 4 a 6 palavras no corpus.',
};

export default async function NgramasPage() {
  const repo = new ArticleSummaryRepository();
  const analyses = await repo.getAll();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-7xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink dark:text-parchment tracking-tight">
          Busca de N-gramas
        </h1>
        <div className="h-1.5 w-24 bg-accent rounded-full mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto">
        <NgramSearch analyses={analyses} />
      </div>
    </div>
  );
}
