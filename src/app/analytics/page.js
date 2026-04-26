import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import AnalyticsClient from '@/components/AnalyticsClient';

export const revalidate = 0;

export const metadata = {
  title: 'Analytics — Compare AI',
  description: 'Análise de métricas e performance dos modelos de IA.',
};

export default async function AnalyticsPage() {
  const repo = new ArticleSummaryRepository();
  const analyses = await repo.getAll();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1C1008] dark:text-[#f0e4d4] tracking-tight">
          Análise de Performance
        </h1>
        <div className="h-1.5 w-24 bg-[#ff6b00] rounded-full mt-4"></div>
      </header>

      <AnalyticsClient analyses={analyses} />
    </div>
  );
}
