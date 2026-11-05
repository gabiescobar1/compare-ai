import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import HistoryClient from '@/components/HistoryClient';
import { OWNER_MODE } from '@/constants/FeatureFlags';

export const revalidate = 0;

export default async function ResultadosPage() {
  const repo = new ArticleSummaryRepository();
  const analyses = await repo.getAll();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <header className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink dark:text-parchment tracking-tight">
          Histórico Arquivado
        </h1>
      </header>

      {/* Página pública e somente leitura: excluir e regenerar só existem com
          o MODO AUTORA ligado (src/constants/FeatureFlags.js). */}
      <HistoryClient
        analyses={analyses}
        canManage={OWNER_MODE}
        canRegenerate={OWNER_MODE}
      />
    </div>
  );
}
