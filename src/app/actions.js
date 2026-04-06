'use server'

import { ArticleProcessorService } from '@/services/ArticleProcessorService';

export async function processSingleDoi(doiInput, selectedModels) {
  const processor = new ArticleProcessorService();
  return await processor.processDoi(doiInput, selectedModels);
}
