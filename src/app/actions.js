'use server'

import { ArticleProcessorService } from '@/services/ArticleProcessorService';

export async function processSingleDoi(doiInput, selectedModels, discipline) {
  const processor = new ArticleProcessorService();
  return await processor.processDoi(doiInput, selectedModels, discipline);
}

import { ArticleSummaryRepository } from '@/repositories/ArticleSummaryRepository';
import { revalidatePath } from 'next/cache';

export async function deleteHistoryRecord(id) {
  const repo = new ArticleSummaryRepository();
  const success = await repo.delete(id);
  if (success) {
    revalidatePath('/resultados');
  }
  return success;
}
