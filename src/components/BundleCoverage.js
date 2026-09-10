'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { DISCIPLINES, disciplineIdFromName } from '@/constants/Disciplines';
import { IconTargetArrow, IconInfoCircle, IconX, IconBook2, IconRobot, IconChevronRight } from '@tabler/icons-react';
import AbstractModal from './AbstractModal';

const PROVIDERS = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'claude', label: 'Claude' },
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bundleStr = (b) => (typeof b === 'string' ? b : b?.bundle);
const pct = (c) => (c.total > 0 ? Math.round((c.found / c.total) * 100) : 0);

const HOVER_MAX = 12; // bundles listados na caixinha antes do "+ N outros"

// Célula da tabela: passar o mouse mostra uma caixinha (portal, posição fixa)
// com os bundles que ocorreram naquele cruzamento; clicar abre o modal
// completo, com os textos em que cada bundle apareceu.
function CoverageCell({ discipline, sourceLabel, cell, highlighted, onOpen }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!hover) return;
    const close = () => setHover(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [hover]);

  const body = (
    <>
      {cell.found}/{cell.total}
      <span className={`text-xs ${highlighted ? 'text-accent/70' : 'text-stone-400 dark:text-[#8a7058]'}`}> ({pct(cell)}%)</span>
    </>
  );

  if (cell.found === 0) return <span>{body}</span>;

  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const width = 300;
    // Altura estimada da caixinha, para decidir se ela cabe abaixo da célula.
    const est = 110 + Math.min(cell.items.length, HOVER_MAX) * 22;
    const left = Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12));
    let top = r.bottom + 6;
    if (top + est > window.innerHeight - 12) top = r.top - est - 6;
    setPos({ top: Math.max(12, top), left });
    setHover(true);
  };

  return (
    <>
      <button
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setHover(false)}
        onFocus={show}
        onBlur={() => setHover(false)}
        onClick={() => { setHover(false); onOpen(); }}
        title="Ver quais bundles ocorreram"
        className="hover:underline cursor-pointer"
      >
        {body}
      </button>
      {hover && createPortal(
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 300, pointerEvents: 'none' }}
          className="z-[150] bg-cream dark:bg-paper-dark border border-stone-200 dark:border-white/10 rounded-2xl shadow-xl p-4 text-left"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 mb-2.5">
            {cell.found} de {cell.total} · {sourceLabel} · {discipline}
          </p>
          <div className="flex flex-col gap-1.5">
            {cell.items.slice(0, HOVER_MAX).map(item => (
              <div key={item.bundle} className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-700 dark:text-[#c4b09a] truncate" title={item.bundle}>{item.bundle}</span>
                <span className="flex-shrink-0 text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">{item.occurrences}×</span>
              </div>
            ))}
          </div>
          {cell.items.length > HOVER_MAX && (
            <p className="text-[10px] text-stone-400 dark:text-[#8a7058] mt-2">
              + {cell.items.length - HOVER_MAX} outro{cell.items.length - HOVER_MAX !== 1 ? 's' : ''}…
            </p>
          )}
          <p className="text-[10px] text-stone-400 dark:text-[#8a7058] mt-3 pt-2 border-t border-stone-100 dark:border-white/5">
            Clique para ver os textos onde ocorrem.
          </p>
        </div>,
        document.body
      )}
    </>
  );
}

// Modal com a lista dos bundles de referência que ocorreram numa célula da
// tabela. Cada bundle lista os textos onde apareceu; clicar num texto abre o
// abstract com o bundle destacado. A aba "Não ocorreram" mostra o resto.
function CoverageBundlesModal({ discipline, sourceLabel, found, total, items, missing, onViewText, onClose }) {
  const [tab, setTab] = useState('found');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tabBtn = (key, label, n) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${
        tab === key
          ? 'bg-accent/10 text-accent'
          : 'text-stone-400 dark:text-[#8a7058] hover:text-stone-600 dark:hover:text-[#c4b09a]'
      }`}
    >
      {label} ({n})
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-ink dark:text-parchment">
              Bundles do CORHUM em {sourceLabel}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-[#8a7058] mt-0.5">
              <IconBook2 className="w-3 h-3 flex-shrink-0" />
              <span>{discipline}</span>
              <span>·</span>
              <span>{found} de {total} bundles de referência</span>
            </div>
          </div>
          <button type="button" onClick={onClose} title="Fechar" className="flex-shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-parchment transition-colors p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-stone-100 dark:border-white/5 flex gap-2 bg-stone-50/50 dark:bg-white/2">
          {tabBtn('found', 'Ocorreram', items.length)}
          {tabBtn('missing', 'Não ocorreram', missing.length)}
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar">
          {tab === 'found' ? (
            items.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-[#8a7058]">Nenhum bundle de referência ocorreu nesses textos.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map(item => (
                  <div key={item.bundle} className="border border-stone-100 dark:border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-stone-50 dark:bg-white/2 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-accent">{item.bundle}</span>
                      <span className="flex-shrink-0 text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {item.occurrences}× · {item.sources.length} texto{item.sources.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-2">
                      {item.sources.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onViewText({
                            title: s.label,
                            discipline: s.discipline,
                            doi: s.doi,
                            content: s.content,
                            highlight: [item.bundle],
                          })}
                          title="Ver o texto"
                          className="group text-left w-full bg-white/40 dark:bg-white/2 border border-stone-100 dark:border-white/5 rounded-lg px-3 py-2 flex flex-col gap-1 hover:border-accent/40 hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-[#c4b09a] min-w-0">
                              <IconRobot className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="truncate">{s.label}</span>
                            </span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              {s.count > 1 && (
                                <span className="text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">{s.count}×</span>
                              )}
                              <IconChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-[#8a7058] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                            </span>
                          </div>
                          {s.title && (
                            <p className="text-xs font-medium text-ink dark:text-parchment leading-snug line-clamp-2" title={s.title}>{s.title}</p>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-[#8a7058]">
                            <IconBook2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate" title={s.doi}>{s.doi}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            missing.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-[#8a7058]">Todos os bundles de referência ocorreram.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {missing.map(b => (
                  <span key={b} className="text-[11px] text-stone-500 dark:text-[#8a7058] bg-stone-100 dark:bg-white/5 px-2 py-1 rounded-lg">{b}</span>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Cobertura de lexical bundles por disciplina: quantos dos bundles de referência
 * (CORHUM) de cada disciplina aparecem nos abstracts de cada fonte, restrito aos
 * artigos daquela disciplina. Destaca a disciplina de maior aproximação.
 */
export default function BundleCoverage({ analyses }) {
  const { bundles } = useLexicalBundles();
  const [detail, setDetail] = useState(null);   // célula aberta no modal de bundles
  const [viewing, setViewing] = useState(null); // abstract aberto no modal

  const data = useMemo(() => {
    if (!bundles || Object.keys(bundles).length === 0 || !analyses || analyses.length === 0) {
      return { loaded: false, rows: [], best: null, unmatched: [] };
    }

    // Agrupa análises por id de disciplina (resolvendo idioma/acento).
    const byId = {};
    analyses.forEach(a => {
      const id = disciplineIdFromName(a.discipline) || a.discipline || 'unknown';
      (byId[id] = byId[id] || []).push(a);
    });

    // Casa cada seção da planilha a um id de disciplina (pt/en, com/sem acento).
    const bundleKeys = Object.keys(bundles);
    const keyForId = {};
    const matchedKeys = new Set();
    bundleKeys.forEach(k => {
      const id = disciplineIdFromName(k);
      if (id && !keyForId[id]) { keyForId[id] = k; matchedKeys.add(k); }
    });

    const rows = [];
    Object.keys(byId).forEach(id => {
      const matchKey = keyForId[id];
      if (!matchKey) return;

      // Bundles únicos (dedup por minúsculas), preservando a grafia da planilha.
      const uniq = new Map();
      bundles[matchKey].map(bundleStr).filter(Boolean).forEach(s => {
        if (!uniq.has(s.toLowerCase())) uniq.set(s.toLowerCase(), s);
      });
      const refBundles = [...uniq.values()];
      if (refBundles.length === 0) return;

      const analysesD = byId[id];
      const discLabel = DISCIPLINES.find(d => d.id === id)?.label || id;

      // Cobertura = nº de bundles de referência que aparecem em ao menos um texto
      // do grupo; guarda também onde cada um ocorreu (para o modal de detalhe).
      const coverageFor = (getTexts) => {
        const texts = [];
        analysesD.forEach(a => getTexts(a).forEach(t => texts.push(t)));

        const items = [];
        const missing = [];
        refBundles.forEach(b => {
          const re = new RegExp(`\\b(${escapeRegExp(b)})\\b`, 'gi');
          let occurrences = 0;
          const sources = [];
          texts.forEach(t => {
            const m = t.content.match(re);
            if (m && m.length > 0) {
              occurrences += m.length;
              sources.push({ ...t, count: m.length });
            }
          });
          if (sources.length > 0) items.push({ bundle: b, occurrences, sources });
          else missing.push(b);
        });
        items.sort((x, y) => y.occurrences - x.occurrences || x.bundle.localeCompare(y.bundle));

        return { found: items.length, total: refBundles.length, items, missing };
      };

      const original = coverageFor(a =>
        a.originalAbstract && !/^sem abstract dispon/i.test(a.originalAbstract.trim())
          ? [{ label: 'Abstract original', doi: a.doi, title: a.title, discipline: discLabel, content: a.originalAbstract }]
          : []
      );
      const perProvider = {};
      PROVIDERS.forEach(p => {
        perProvider[p.key] = coverageFor(a =>
          (a.summaries || [])
            .filter(s => s.provider === p.key && s.content && !s.content.includes('ERRO'))
            .map(s => ({ label: p.label, doi: a.doi, title: a.title, discipline: discLabel, content: s.content }))
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
          Passe o mouse sobre um valor para ver quais bundles ocorreram; clique para abrir os textos.
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
                        <CoverageCell
                          discipline={row.discipline}
                          sourceLabel="Abstracts originais"
                          cell={row.original}
                          onOpen={() => setDetail({ discipline: row.discipline, sourceLabel: 'abstracts originais', cell: row.original })}
                        />
                      </td>
                      {PROVIDERS.map(p => {
                        const c = row.perProvider[p.key];
                        const isBest = p.key === bestKey && c.found > 0;
                        return (
                          <td key={p.key} className={`py-2.5 px-3 text-right ${isBest ? 'font-black text-accent' : 'text-stone-600 dark:text-[#c4b09a]'}`}>
                            <CoverageCell
                              discipline={row.discipline}
                              sourceLabel={p.label}
                              cell={c}
                              highlighted={isBest}
                              onOpen={() => setDetail({ discipline: row.discipline, sourceLabel: p.label, cell: c })}
                            />
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

      {detail && (
        <CoverageBundlesModal
          discipline={detail.discipline}
          sourceLabel={detail.sourceLabel}
          found={detail.cell.found}
          total={detail.cell.total}
          items={detail.cell.items}
          missing={detail.cell.missing}
          onViewText={setViewing}
          onClose={() => setDetail(null)}
        />
      )}

      {viewing && (
        <AbstractModal {...viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
