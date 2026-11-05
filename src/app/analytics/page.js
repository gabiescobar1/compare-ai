import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import AnalyticsClient from '@/components/AnalyticsClient';
import { ANALYTICS_PUBLISHED } from '@/constants/FeatureFlags';
import { IconTool } from '@tabler/icons-react';

export const revalidate = 0;

export const metadata = {
  title: 'Analytics — Compare AI',
  description: 'Análise de métricas e performance dos modelos de IA.',
};

// Aviso que substitui a página enquanto ANALYTICS_PUBLISHED é false. Os
// gráficos seguem prontos em AnalyticsClient — basta religar o interruptor.
function UnderConstruction() {
  return (
    <div className="max-w-xl mx-auto text-center border border-stone-200 dark:border-white/8 bg-cream dark:bg-paper-dark rounded-3xl p-12 shadow-sm">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <IconTool className="w-7 h-7 text-accent" />
      </div>
      <h2 className="text-xl font-serif font-black text-ink dark:text-parchment tracking-tight">
        Em construção
      </h2>
      <p className="text-sm text-stone-600 dark:text-[#9a8070] mt-3 leading-relaxed">
        Esta página está sendo preparada e volta ao ar em breve.
      </p>
    </div>
  );
}

export default async function AnalyticsPage() {
  // Com a página fechada, nem busca os dados — não faz sentido ler 160
  // análises do banco para desenhar um aviso.
  const analyses = ANALYTICS_PUBLISHED
    ? await new ArticleSummaryRepository().getAll()
    : [];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-7xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink dark:text-parchment tracking-tight">
          Analytics
        </h1>
        <div className="h-1.5 w-24 bg-accent rounded-full mt-4"></div>
      </header>

      {ANALYTICS_PUBLISHED ? <AnalyticsClient analyses={analyses} /> : <UnderConstruction />}
    </div>
  );
}
