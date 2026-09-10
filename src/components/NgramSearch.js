'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { DISCIPLINES, disciplineIdFromName } from '@/constants/Disciplines';
import {
  IconSearch, IconDownload, IconInfoCircle, IconX, IconBook2, IconRobot,
  IconChevronRight, IconChevronUp, IconChevronDown,
} from '@tabler/icons-react';
import { tokenizeSegments, countTokens, buildNgramIndex } from '@/lib/ngrams';
import AbstractModal from './AbstractModal';

const SOURCE_LABELS = { openai: 'OpenAI', gemini: 'Gemini', claude: 'Claude', original: 'Abstracts originais' };
const sourceLabel = (s) => SOURCE_LABELS[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Desconhecido');

// Colunas fixas de comparação por fonte.
const SOURCE_COLUMNS = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'claude', label: 'Claude' },
  { key: 'original', label: 'Originais' },
];

const N_SIZES = [4, 5, 6];
const PAGE = 100;

const fmt = (n) => n.toLocaleString('pt-BR');

// Cabeçalho de coluna ordenável.
function SortHeader({ label, sortKey, align = 'right', title, sort, onSort }) {
  return (
    <th className={`py-2 px-3 font-bold whitespace-nowrap ${align === 'left' ? 'text-left' : 'text-right'}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={title || `Ordenar por ${label}`}
        className={`inline-flex items-center gap-0.5 hover:text-accent transition-colors ${sort.key === sortKey ? 'text-accent' : ''}`}
      >
        {label}
        {sort.key === sortKey && (
          sort.dir === 'desc'
            ? <IconChevronDown className="w-3 h-3" />
            : <IconChevronUp className="w-3 h-3" />
        )}
      </button>
    </th>
  );
}

// Modal com as ocorrências de uma sequência: em que textos ela aparece.
// Clicar num texto abre o abstract com a sequência destacada.
function NgramOccurrencesModal({ row, texts, onViewText, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const hits = row.hits.map(h => ({ ...texts[h.textIndex], count: h.count }));

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-accent">{row.ngram}</p>
            <p className="text-[11px] text-stone-500 dark:text-[#8a7058] mt-0.5">
              {fmt(row.total)} ocorrência{row.total !== 1 ? 's' : ''} no corpus-alvo · {fmt(row.range)} texto{row.range !== 1 ? 's' : ''} · {hits.length} texto{hits.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <button type="button" onClick={onClose} title="Fechar" className="flex-shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-parchment transition-colors p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
          {hits.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onViewText({
                title: s.label,
                discipline: s.discipline,
                doi: s.doi,
                content: s.content,
                highlight: [row.ngram],
                loose: true,
              })}
              title="Ver o texto"
              className="group text-left w-full bg-stone-50 dark:bg-white/2 border border-stone-100 dark:border-white/5 rounded-lg px-3 py-2 flex flex-col gap-1 hover:border-accent/40 hover:bg-accent/5 transition-colors"
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
                <span className="flex-shrink-0">{s.discipline}</span>
                <span>·</span>
                <span className="truncate" title={s.doi}>{s.doi}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Busca de n-gramas no corpus, nos moldes da ferramenta N-gram do Sketch
 * Engine (Kilgarriff et al., 2014): lista as sequências de 4 a 6 palavras que
 * recorrem no corpus escolhido, com frequência bruta, frequência normalizada
 * (por milhão de palavras) e dispersão (em quantos textos ocorrem), filtráveis
 * por disciplina. Marca as sequências que constam da lista do CORHUM.
 */
export default function NgramSearch({ analyses }) {
  const { bundles } = useLexicalBundles();

  const [discipline, setDiscipline] = useState('all');
  const [corpus, setCorpus] = useState('ai');
  const [n, setN] = useState(4);
  const [minFreq, setMinFreq] = useState(3);
  const [minRange, setMinRange] = useState(2);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'total', dir: 'desc' });
  const [view, setView] = useState({ signature: '', limit: PAGE });
  const [detail, setDetail] = useState(null);  // sequência aberta no modal
  const [viewing, setViewing] = useState(null); // abstract aberto no modal

  // Tokeniza o corpus inteiro uma única vez (o passo mais caro).
  const allTexts = useMemo(() => {
    const texts = [];
    (analyses || []).forEach(a => {
      const id = disciplineIdFromName(a.discipline) || a.discipline || 'unknown';
      const discLabel = DISCIPLINES.find(d => d.id === id)?.label || a.discipline || 'Desconhecida';
      const base = { doi: a.doi, title: a.title, disciplineId: id, discipline: discLabel };

      if (a.originalAbstract && !/^sem abstract dispon/i.test(a.originalAbstract.trim())) {
        texts.push({
          ...base, source: 'original', label: 'Abstract original',
          content: a.originalAbstract, segments: tokenizeSegments(a.originalAbstract),
        });
      }
      (a.summaries || []).forEach(s => {
        if (!s.content || s.content.includes('ERRO')) return;
        texts.push({
          ...base, source: s.provider || 'desconhecido', label: sourceLabel(s.provider),
          content: s.content, segments: tokenizeSegments(s.content),
        });
      });
    });
    return texts;
  }, [analyses]);

  // Disciplinas efetivamente presentes no histórico.
  const availableDisciplines = useMemo(() => {
    const ids = new Set(allTexts.map(t => t.disciplineId));
    return DISCIPLINES.filter(d => ids.has(d.id));
  }, [allTexts]);

  // Fontes de IA presentes (qualquer provider que não seja o abstract original).
  const aiSources = useMemo(
    () => [...new Set(allTexts.filter(t => t.source !== 'original').map(t => t.source))],
    [allTexts]
  );

  const texts = useMemo(
    () => (discipline === 'all' ? allTexts : allTexts.filter(t => t.disciplineId === discipline)),
    [allTexts, discipline]
  );

  const targetSources = useMemo(
    () => (corpus === 'ai' ? aiSources : [corpus]),
    [corpus, aiSources]
  );

  // Tamanho do corpus-alvo, para a frequência normalizada por milhão.
  const targetStats = useMemo(() => {
    const target = new Set(targetSources);
    let words = 0, count = 0;
    texts.forEach(t => {
      if (!target.has(t.source)) return;
      words += countTokens(t.segments);
      count += 1;
    });
    return { words, count };
  }, [texts, targetSources]);

  // Índice de n-gramas. Piso fixo de 2 para o índice; o filtro de frequência
  // escolhido pelo usuário é aplicado depois, sem recalcular tudo.
  const index = useMemo(
    () => buildNgramIndex(texts, n, targetSources, 2),
    [texts, n, targetSources]
  );

  // Bundles do CORHUM da disciplina selecionada (ou de todas), para marcar
  // quais sequências já constam da lista de referência.
  const corhum = useMemo(() => {
    const set = new Set();
    if (!bundles) return set;
    Object.keys(bundles).forEach(key => {
      const id = disciplineIdFromName(key);
      if (discipline !== 'all' && id !== discipline) return;
      bundles[key].forEach(b => {
        const str = typeof b === 'string' ? b : b?.bundle;
        if (str) set.add(str.trim().toLowerCase());
      });
    });
    return set;
  }, [bundles, discipline]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = index.filter(r =>
      r.total >= minFreq && r.range >= minRange && (!q || r.ngram.includes(q))
    );

    const value = (r) => {
      if (sort.key === 'ngram') return r.ngram;
      if (sort.key === 'total' || sort.key === 'perMillion') return r.total;
      if (sort.key === 'range') return r.range;
      return r.bySource[sort.key] || 0;
    };
    out.sort((a, b) => {
      const va = value(a), vb = value(b);
      let cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      if (cmp === 0) cmp = a.ngram.localeCompare(b.ngram) * -1;
      return sort.dir === 'desc' ? -cmp : cmp;
    });
    return out;
  }, [index, minFreq, minRange, search, sort]);

  // Quantas linhas mostrar. Derivado dos critérios: mudou o filtro, a lista
  // volta à primeira página sem precisar de um efeito.
  const signature = `${discipline}|${corpus}|${n}|${minFreq}|${minRange}|${search}|${sort.key}|${sort.dir}`;
  const limit = view.signature === signature ? view.limit : PAGE;

  const perMillion = (total) =>
    (targetStats.words > 0 ? Math.round((total / targetStats.words) * 1_000_000) : 0);

  const toggleSort = (key) => {
    setSort(prev => (prev.key === key
      ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: key === 'ngram' ? 'asc' : 'desc' }));
  };

  const exportXlsx = () => {
    const data = rows.map((r, i) => ({
      '#': i + 1,
      'Sequência': r.ngram,
      'Palavras': n,
      'Disciplina': discipline === 'all' ? 'Todas' : (DISCIPLINES.find(d => d.id === discipline)?.label || discipline),
      'Corpus-alvo': corpus === 'ai' ? 'Todas as IAs' : sourceLabel(corpus),
      'Frequência': r.total,
      'Por milhão': perMillion(r.total),
      'Textos': r.range,
      ...Object.fromEntries(SOURCE_COLUMNS.map(c => [c.label, r.bySource[c.key] || 0])),
      'CORHUM': corhum.has(r.ngram) ? 'sim' : 'não',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), `${n}-gramas`);
    XLSX.writeFile(wb, `ngramas-${n}-palavras.xlsx`);
  };

  const selectClass = 'bg-cream dark:bg-paper-dark border border-stone-300 dark:border-white/10 text-stone-800 dark:text-parchment text-sm font-bold rounded-xl shadow-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent appearance-none transition-colors';
  const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 mb-1.5';

  return (
    <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5">
        <h3 className="font-serif font-black text-ink dark:text-parchment flex items-center gap-2">
          <IconSearch className="w-5 h-5 text-accent" />
          Busca de n-gramas no corpus
        </h3>
        <p className="text-xs text-stone-500 dark:text-[#9a8070] mt-2 max-w-3xl">
          Lista as sequências de 4 a 6 palavras que recorrem no corpus, com frequência bruta,
          frequência normalizada por milhão de palavras e dispersão (em quantos textos ocorrem) —
          os critérios usuais de identificação de lexical bundles. As sequências não atravessam
          fronteira de frase (ponto, dois-pontos, ponto e vírgula, travessão, parênteses e
          parágrafo), mas atravessam vírgulas. Clique numa sequência para ver os textos onde ela ocorre.
        </p>
      </div>

      {allTexts.length === 0 ? (
        <div className="p-8">
          <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
            <IconInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Ainda não há textos no histórico para compor o corpus.</span>
          </div>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-white/2">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[180px]">
                <label className={labelClass} htmlFor="ngram-disc">Disciplina</label>
                <select id="ngram-disc" className={`${selectClass} w-full`} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                  <option value="all">Todas as disciplinas</option>
                  {availableDisciplines.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[170px]">
                <label className={labelClass} htmlFor="ngram-corpus">Corpus-alvo</label>
                <select id="ngram-corpus" className={`${selectClass} w-full`} value={corpus} onChange={(e) => setCorpus(e.target.value)}>
                  <option value="ai">Todas as IAs</option>
                  {aiSources.map(s => (
                    <option key={s} value={s}>{sourceLabel(s)}</option>
                  ))}
                  <option value="original">Abstracts originais</option>
                </select>
              </div>

              <div>
                <span className={labelClass}>Palavras na sequência</span>
                <div className="inline-flex bg-cream dark:bg-paper-dark p-1 rounded-xl border border-stone-300 dark:border-white/10 shadow-sm">
                  {N_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setN(size)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${n === size ? 'bg-accent text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:text-[#9a8070] dark:hover:text-parchment'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-28">
                <label className={labelClass} htmlFor="ngram-freq">Freq. mínima</label>
                <input
                  id="ngram-freq"
                  type="number"
                  min={2}
                  value={minFreq}
                  onChange={(e) => setMinFreq(Math.max(2, Number(e.target.value) || 2))}
                  className={`${selectClass} w-full`}
                />
              </div>

              <div className="w-28">
                <label className={labelClass} htmlFor="ngram-range">Em nº de textos</label>
                <input
                  id="ngram-range"
                  type="number"
                  min={1}
                  value={minRange}
                  onChange={(e) => setMinRange(Math.max(1, Number(e.target.value) || 1))}
                  className={`${selectClass} w-full`}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className={labelClass} htmlFor="ngram-q">Contém</label>
                <div className="relative">
                  <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-[#8a7058]" />
                  <input
                    id="ngram-q"
                    type="text"
                    placeholder="ex.: the results of"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${selectClass} w-full pl-9 font-medium placeholder-stone-400 dark:placeholder-[#8a7058]`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={exportXlsx}
                disabled={rows.length === 0}
                title="Exportar a lista para Excel"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-accent text-white shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <IconDownload className="w-4 h-4" /> Exportar
              </button>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-[#8a7058] mt-4">
              Corpus-alvo: <strong>{fmt(targetStats.count)}</strong> texto{targetStats.count !== 1 ? 's' : ''} ·{' '}
              <strong>{fmt(targetStats.words)}</strong> palavras ·{' '}
              <strong>{fmt(rows.length)}</strong> sequência{rows.length !== 1 ? 's' : ''} de {n} palavras
              com ≥ {minFreq} ocorrência{minFreq !== 1 ? 's' : ''} em ≥ {minRange} texto{minRange !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Resultados */}
          {rows.length === 0 ? (
            <div className="p-8">
              <div className="flex items-start gap-2 text-sm text-stone-500 dark:text-[#8a7058] bg-stone-50 dark:bg-white/2 border border-stone-200 dark:border-white/5 rounded-xl px-4 py-3">
                <IconInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Nenhuma sequência atende a esses critérios. Tente reduzir a frequência mínima ou o número de textos.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="p-8 overflow-x-auto custom-scrollbar-h">
                <table className="w-full text-left border-collapse text-sm" style={{ minWidth: 820 }}>
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-white/10 text-stone-500 dark:text-[#9a8070]">
                      <th className="py-2 pr-2 font-bold text-right w-10">#</th>
                      <SortHeader label="Sequência" sortKey="ngram" align="left" sort={sort} onSort={toggleSort} />
                      <SortHeader label="Freq." sortKey="total" title="Ocorrências no corpus-alvo" sort={sort} onSort={toggleSort} />
                      <SortHeader label="/milhão" sortKey="perMillion" title="Ocorrências por milhão de palavras do corpus-alvo" sort={sort} onSort={toggleSort} />
                      <SortHeader label="Textos" sortKey="range" title="Em quantos textos do corpus-alvo a sequência ocorre" sort={sort} onSort={toggleSort} />
                      {SOURCE_COLUMNS.map(c => (
                        <SortHeader key={c.key} label={c.label} sortKey={c.key} sort={sort} onSort={toggleSort} />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, limit).map((r, i) => (
                      <tr key={r.ngram} className="border-b border-stone-100 dark:border-white/5 last:border-0 hover:bg-accent/5 transition-colors">
                        <td className="py-2.5 pr-2 text-right text-[11px] text-stone-400 dark:text-[#8a7058]">{i + 1}</td>
                        <td className="py-2.5 pr-4">
                          <button
                            type="button"
                            onClick={() => setDetail(r)}
                            title="Ver os textos onde ocorre"
                            className="text-left font-bold text-ink dark:text-parchment hover:text-accent hover:underline transition-colors"
                          >
                            {r.ngram}
                          </button>
                          {corhum.has(r.ngram) && (
                            <span className="ml-2 text-[9px] font-black uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded align-middle" title="Consta da lista de referência do CORHUM">
                              CORHUM
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-accent">{fmt(r.total)}</td>
                        <td className="py-2.5 px-3 text-right text-stone-600 dark:text-[#c4b09a]">{fmt(perMillion(r.total))}</td>
                        <td className="py-2.5 px-3 text-right text-stone-600 dark:text-[#c4b09a]">{fmt(r.range)}</td>
                        {SOURCE_COLUMNS.map(c => {
                          const v = r.bySource[c.key] || 0;
                          return (
                            <td key={c.key} className={`py-2.5 px-3 text-right ${v > 0 ? 'text-stone-600 dark:text-[#c4b09a]' : 'text-stone-300 dark:text-[#5a4436]'}`}>
                              {fmt(v)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > limit && (
                <div className="px-8 pb-8 -mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setView({ signature, limit: limit + PAGE })}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    Mostrar mais {Math.min(PAGE, rows.length - limit)} de {fmt(rows.length - limit)} restantes
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {detail && (
        <NgramOccurrencesModal
          row={detail}
          texts={texts}
          onViewText={setViewing}
          onClose={() => setDetail(null)}
        />
      )}

      {viewing && <AbstractModal {...viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
