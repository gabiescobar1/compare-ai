export interface AIGeneratedAbstract {
  system: string;
  text: string;
}

export interface LexicalBundle {
  phrase: string;
  normalizedOriginalFreq?: number;
}

export interface BundleAnalytics {
  phrase: string;
  normalizedOriginalFreq: number | null;
  systemCounts: Record<string, number>;
}

// Helper to escape regex characters to safely use phrases in a Regex
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Analyzes the frequency of lexical bundles across different AI-generated abstracts.
 */
export function analyzeBundles(
  bundles: LexicalBundle[],
  abstracts: AIGeneratedAbstract[]
): BundleAnalytics[] {
  return bundles.map(bundle => {
    const systemCounts: Record<string, number> = {};

    abstracts.forEach(abstract => {
      const regex = new RegExp(`\\b${escapeRegExp(bundle.phrase)}\\b`, 'gi');
      const matches = abstract.text.match(regex);
      systemCounts[abstract.system] = matches ? matches.length : 0;
    });

    return {
      phrase: bundle.phrase,
      normalizedOriginalFreq: bundle.normalizedOriginalFreq || null,
      systemCounts
    };
  });
}
