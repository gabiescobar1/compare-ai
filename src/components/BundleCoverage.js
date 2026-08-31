'use client';

import React, { useMemo } from 'react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { DISCIPLINES } from '@/constants/Disciplines';
import { IconTargetArrow, IconInfoCircle } from '@tabler/icons-react';

const PROVIDERS = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'claude', label: 'Claude' },
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bundleStr = (b) => (typeof b === 'string' ? b : b?.bundle);

/**
 * Cobertura de lexical bundles por disciplina: quantos dos bundles de referência
 * (CORHUM) de cada disciplina aparecem nos abstracts de cada fonte, restrito aos
 * artigos daquela disciplina. Destaca a disciplina de maior aproximação.
 */
export default function BundleCoverage({ analyses }) {
  const { bundles } = useLexicalBundles();

  const data = useMemo(() => {
    if (!bundles || Object.keys(bundles).length === 0 || !analyses || analyses.length === 0) {
      return { loaded: false, rows: [], best: null, unmatched: [] };
    }

    // Agrupa análises pelo rótulo de disciplina.
    const byDisc = {};
    analyses.forEach(a => {
      const label = DISCIPLINES.find(d => d.id === a.discipline)?.label || a.discipline || 'Desconhecida';
      (byDisc[label] = byDisc[label] || []).push(a);
    });

    const bundleKeys = Object.keys(bundles);
    const matchedKeys = new Set();
    const rows = [];

    Object.keys(byDisc).forEach(discLabel => {
      const matchKey = bundleKeys.find(k => k.toLowerCase() === discLabel.toLowerCase());
      if (!matchKey) return;
      matchedKeys.add(matchKey);

      const refBundles = [...new Set(
        bundles[matchKey].map(bundleStr).filter(Boolean).map(s => s.toLowerCase())
      )];
      if (refBundles.length === 0) return;

      const regexes = refBundles.map(b => new RegExp(`\\b(${escapeRegExp(b)})\\b`, 'i'));
      const analysesD = byDisc[discLabel];

      // Cobertura = nº de bundles de referência que aparecem em ao menos um texto do grupo.
      const coverageFor = (getTexts) => {
        const texts = [];
        analysesD.forEach(a => getTexts(a).forEach(t => texts.push(t)));
        let found = 0;
        for (const re of regexes) if (texts.some(t => re.test(t))) found += 1;
        return { found, total: refBundles.length };
      };

      const original = coverageFor(a =>
        a.originalAbstract && !/^sem abstract dispon/i.test(a.originalAbstract.trim()) ? [a.originalAbstract] : []
      );
      const perProvider = {};
      PROVIDERS.forEach(p => {
        perProvider[p.key] = coverageFor(a =>
          (a.summaries || [])
            .filter(s => s.provider === p.key && s.content && !s.content.includes('ERRO'))
            .map(s => s.content)
        );
      });

      rows.push({ discipline: discLabel, refCount: refBundles.length, original, perProvider });
    });

    rows.sort((a, b) => a.discipline.localeCompare(b.discipline));

    // Maior aproximação: maior cobertura de IA (qualquer sistema) entre as disciplinas.
    let best = null;
    rows.forEach(r => {
      PROVIDERS.forEach(p => {
        const c = r.perProvider[p.key];
        if (c.total > 0) {
          const ratio = c.found / c.total;
          if (!best || ratio > best.ratio) {
            best = { discipline: r.discipline, provider: p.label, ratio, found: c.found, total: c.total };
          }
        }
      });
    });

    const unmatched = bundleKeys.filter(k => !matchedKeys.has(k));
    return { loaded: true, rows, best, unmatched };
  }, [analyses, bundles]);

  if (!data.loaded) return null; // sem planilha carregada — nada a mostrar

  const cellPct = (c) => (c.total > 0 ? Math.round((c.found / c.total) * 100) : 0);

  // Índice do provedor com maior cobertura na linha (para destacar).
  const bestProviderKey = (row) => {
    let key = null, val = -1;
    PROVIDERS.forEach(p => {
      const c = row.perProvider[p.key];
      const r = c.total > 0 ? c.found / c.total : -1;
      if (r > val) { val = r; key = p.key; }
    });
    return key;
  };

  return (
    <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5">
        <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
          <IconTargetArrow className="w-5 h-5 text-accent" />
          Cobertura de bundles do CORHUM por disciplina
        </h3>
        <p className="text-xs text-stone-500 dark:text-[#9a8070] mt-2 max-w-3xl">
          Proporção dos lexical bundles de referência (CORHUM) de cada disciplina que aparecem
          nos abstracts de cada fonte, considerando apenas os artigos daquela disciplina.
          Valores maiores indicam maior aproximação ao repertório fraseológico autêntico.
        </p>
      </div>

      {data.rows.length === 0 ? (
        <div className="p-8">
          <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
            <IconInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Nenhuma seção da planilha casou com as disciplinas dos artigos. Verifique se os títulos
              das seções na planilha correspondem aos nomes das disciplinas (ex.: <em>Linguistics</em>, <em>Psychology</em>).
            </span>
          </div>
        </div>
      ) : (
        <>
          {data.best && (
            <div className="px-8 py-4 bg-accent/5 border-b border-stone-100 dark:border-white/5">
              <p className="text-sm text-stone-700 dark:text-[#c4b09a] flex items-center gap-2 flex-wrap">
                <IconTargetArrow className="w-4 h-4 text-accent flex-shrink-0" />
                <span>
                  Maior aproximação: <strong className="text-accent">{data.best.discipline}</strong> —{' '}
                  <strong>{data.best.provider}</strong> reproduz{' '}
                  <strong>{data.best.found}/{data.best.total}</strong> bundles ({Math.round(data.best.ratio * 100)}%).
                </span>
              </p>
            </div>
          )}

          <div className="p-8 overflow-x-auto custom-scrollbar-h">
            <table className="w-full text-left border-collapse text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr className="border-b border-stone-200 dark:border-white/10 text-stone-500 dark:text-[#9a8070]">
                  <th className="py-2 pr-4 font-bold">Disciplina</th>
                  <th className="py-2 px-3 font-bold text-right whitespace-nowrap">Bundles ref.</th>
                  <th className="py-2 px-3 font-bold text-right">Originais</th>
                  {PROVIDERS.map(p => (
                    <th key={p.key} className="py-2 px-3 font-bold text-right">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map(row => {
                  const bestKey = bestProviderKey(row);
                  return (
                    <tr key={row.discipline} className="border-b border-stone-100 dark:border-white/5 last:border-0">
                      <td className="py-2.5 pr-4 font-bold text-ink dark:text-parchment">{row.discipline}</td>
                      <td className="py-2.5 px-3 text-right text-stone-500 dark:text-[#8a7058]">{row.refCount}</td>
                      <td className="py-2.5 px-3 text-right text-stone-600 dark:text-[#c4b09a]">
                        {row.original.found}/{row.original.total}
                        <span className="text-xs text-stone-400 dark:text-[#8a7058]"> ({cellPct(row.original)}%)</span>
                      </td>
                      {PROVIDERS.map(p => {
                        const c = row.perProvider[p.key];
                        const isBest = p.key === bestKey && c.found > 0;
                        return (
                          <td key={p.key} className={`py-2.5 px-3 text-right ${isBest ? 'font-black text-accent' : 'text-stone-600 dark:text-[#c4b09a]'}`}>
                            {c.found}/{c.total}
                            <span className={`text-xs ${isBest ? 'text-accent/70' : 'text-stone-400 dark:text-[#8a7058]'}`}> ({cellPct(c)}%)</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.unmatched.length > 0 && (
            <div className="px-8 pb-6 -mt-2">
              <p className="text-[11px] text-stone-400 dark:text-[#8a7058]">
                Seções da planilha sem correspondência de disciplina (ignoradas): {data.unmatched.join(', ')}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
