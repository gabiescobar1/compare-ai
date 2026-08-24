'use client';

import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  IconChartPie,
  IconPackage,
  IconArrowLeft,
  IconBook2,
  IconChevronRight,
  IconFileText,
  IconRobot,
  IconLoader2,
} from '@tabler/icons-react';
import { DISCIPLINES } from '@/constants/Disciplines';
import PieChart from './PieChart';

const PROVIDER_META = {
  openai: { label: 'OpenAI', color: '#10a37f' },
  gemini: { label: 'Google Gemini', color: '#4285f4' },
  claude: { label: 'Anthropic Claude', color: '#ff6b00' },
};

const providerMeta = (p) =>
  PROVIDER_META[p] || {
    label: p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Desconhecido',
    color: '#9ca3af',
  };

const countWords = (t) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);
const slug = (s) => (s || '').replace(/[^a-z0-9]/gi, '_');

export default function DisciplineAnalysis({ analyses }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);

  // Executa um download marcando o botão como ocupado (spinner + disable).
  const run = async (id, fn) => {
    if (busy) return;
    setBusy(id);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  // Agrupa abstracts gerados (excluindo originais e erros) por disciplina.
  const byDiscipline = useMemo(() => {
    const map = {};
    analyses.forEach((a) => {
      const label = DISCIPLINES.find((d) => d.id === a.discipline)?.label || a.discipline || 'Desconhecida';
      if (!map[label]) {
        map[label] = { discipline: label, summaries: [], providers: {}, analysisCount: 0, originalWords: 0, originalCount: 0 };
      }
      map[label].analysisCount += 1;
      const originalWords = countWords(a.originalAbstract);
      if (originalWords > 0) {
        map[label].originalWords += originalWords;
        map[label].originalCount += 1;
      }
      (a.summaries || []).forEach((s) => {
        if (!s.content || s.content.includes('ERRO')) return;
        const words = countWords(s.content);
        if (words === 0) return;
        map[label].summaries.push({
          doi: a.doi,
          provider: s.provider,
          model_id: s.model_id,
          content: s.content,
          words,
        });
        const p = s.provider || 'desconhecido';
        if (!map[label].providers[p]) map[label].providers[p] = { words: 0, count: 0 };
        map[label].providers[p].words += words;
        map[label].providers[p].count += 1;
      });
    });
    return Object.values(map)
      .filter((d) => d.summaries.length > 0)
      .sort((a, b) => b.summaries.length - a.summaries.length);
  }, [analyses]);

  const saveZip = async (zip, fileName) => {
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Adiciona os .txt a um destino (zip ou subpasta), evitando nomes duplicados.
  const addFiles = (target, entries, baseName) => {
    const used = {};
    entries.forEach((e) => {
      const base = baseName(e);
      used[base] = (used[base] || 0) + 1;
      target.file(used[base] > 1 ? `${base}_${used[base]}.txt` : `${base}.txt`, e.content);
    });
  };

  const fileBase = (e) =>
    `${slug(e.doi) || 'doi'}_${providerMeta(e.provider).label.replace(/\s+/g, '_')}_${e.model_id}`;

  // Download achatado — usado dentro de uma disciplina específica.
  const downloadZip = async (entries, fileName) => {
    if (!entries.length) return;
    const zip = new JSZip();
    addFiles(zip, entries, fileBase);
    await saveZip(zip, fileName);
  };

  // Todas as disciplinas, em subpastas por disciplina.
  const downloadAllByDiscipline = async () => {
    const zip = new JSZip();
    byDiscipline.forEach((d) => {
      addFiles(zip.folder(slug(d.discipline) || 'disciplina'), d.summaries, fileBase);
    });
    await saveZip(zip, 'abstracts_todas_disciplinas.zip');
  };

  // Todas as disciplinas, em subpastas por IA.
  const downloadAllByAI = async () => {
    const zip = new JSZip();
    const entries = byDiscipline.flatMap((d) =>
      d.summaries.map((s) => ({ ...s, discipline: d.discipline }))
    );
    [...new Set(entries.map((e) => e.provider))].forEach((p) => {
      addFiles(
        zip.folder(providerMeta(p).label.replace(/\s+/g, '_')),
        entries.filter((e) => e.provider === p),
        (e) => `${slug(e.discipline)}_${slug(e.doi) || 'doi'}_${e.model_id}`
      );
    });
    await saveZip(zip, 'abstracts_por_IA.zip');
  };

  // ---------- VISÃO DE LISTA ----------
  if (!selected) {
    if (byDiscipline.length === 0) {
      return (
        <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm p-10 text-center">
          <IconChartPie className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-white/10" />
          <p className="text-stone-500 dark:text-[#9a8070] font-medium">
            Nenhum abstract gerado disponível para análise por disciplina.
          </p>
        </div>
      );
    }

    const totalAbstracts = byDiscipline.reduce((s, d) => s + d.summaries.length, 0);

    return (
      <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
        {/* Header com título dentro da caixa */}
        <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5 flex items-center gap-2">
          <IconChartPie className="w-5 h-5 text-accent" />
          <h3 className="font-serif font-black text-ink dark:text-parchment">Análise por Disciplina</h3>
        </div>

        <div className="p-8 space-y-8">
          {/* Grade de disciplinas */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 mb-3">
              Selecione uma disciplina
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {byDiscipline.map((d) => (
                <button
                  key={d.discipline}
                  onClick={() => setSelected(d.discipline)}
                  className="group text-left bg-stone-50/50 dark:bg-white/2 rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm p-5 flex flex-col gap-3 hover:border-accent/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <IconBook2 className="w-5 h-5 text-accent" />
                    </span>
                    <IconChevronRight className="w-4 h-4 text-stone-300 dark:text-[#8a7058] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink dark:text-parchment text-sm truncate" title={d.discipline}>
                      {d.discipline}
                    </h4>
                    <p className="text-xs text-stone-400 dark:text-[#8a7058] mt-1">
                      {d.summaries.length} abstracts · {Object.keys(d.providers).length} IAs
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exportar tudo — no fim da seção */}
          <div className="border-t border-stone-100 dark:border-white/5 pt-8">
            <div className="flex items-center gap-2 mb-1">
              <IconPackage className="w-5 h-5 text-accent" />
              <h4 className="font-serif font-black text-ink dark:text-parchment">Exportar tudo</h4>
            </div>
            <p className="text-xs text-stone-400 dark:text-[#8a7058] mb-4">
              {totalAbstracts} abstracts gerados em {byDiscipline.length} disciplina{byDiscipline.length !== 1 ? 's' : ''} (sem os originais), organizados em subpastas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => run('all-disc', downloadAllByDiscipline)}
                disabled={!!busy}
                className="flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl border border-stone-200 dark:border-white/10 bg-cream dark:bg-[#1e1410] text-stone-700 dark:text-[#c4b09a] shadow-sm transition-colors hover:bg-gradient-to-r hover:from-accent hover:to-accent-2 hover:text-white hover:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy === 'all-disc' ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconBook2 className="w-4 h-4" />} Tudo, por disciplina (.zip)
              </button>
              <button
                onClick={() => run('all-ai', downloadAllByAI)}
                disabled={!!busy}
                className="flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl border border-stone-200 dark:border-white/10 bg-cream dark:bg-[#1e1410] text-stone-700 dark:text-[#c4b09a] shadow-sm transition-colors hover:bg-gradient-to-r hover:from-accent hover:to-accent-2 hover:text-white hover:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy === 'all-ai' ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconRobot className="w-4 h-4" />} Tudo, por IA (.zip)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- VISÃO DE DETALHE (subpágina) ----------
  const data = byDiscipline.find((d) => d.discipline === selected);
  if (!data) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 dark:text-[#9a8070] hover:text-accent transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" /> Voltar para disciplinas
        </button>
        <p className="text-stone-500 dark:text-[#9a8070]">Esta disciplina não tem mais dados disponíveis.</p>
      </div>
    );
  }

  const pieData = Object.entries(data.providers)
    .map(([p, pd]) => ({
      label: providerMeta(p).label,
      value: Math.round(pd.words / pd.count),
      color: providerMeta(p).color,
    }))
    .sort((a, b) => b.value - a.value);

  const presentProviders = Object.keys(data.providers);

  // Média geral de palavras: abstracts gerados por IA vs. originais dos DOIs.
  const aiTotalWords = Object.values(data.providers).reduce((s, pd) => s + pd.words, 0);
  const aiTotalCount = Object.values(data.providers).reduce((s, pd) => s + pd.count, 0);
  const avgAi = aiTotalCount > 0 ? Math.round(aiTotalWords / aiTotalCount) : 0;
  const avgOriginal = data.originalCount > 0 ? Math.round(data.originalWords / data.originalCount) : 0;
  const maxAvg = Math.max(avgAi, avgOriginal, 1);
  const diff = avgAi - avgOriginal;

  return (
    <div className="bg-cream dark:bg-paper-dark rounded-3xl border border-stone-200 dark:border-white/8 shadow-sm overflow-hidden">
      {/* Header: voltar + título dentro da caixa */}
      <div className="px-8 py-6 border-b border-stone-100 dark:border-white/5">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-[#9a8070] hover:text-accent transition-colors mb-4"
        >
          <IconArrowLeft className="w-4 h-4" /> Voltar para disciplinas
        </button>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <IconBook2 className="w-6 h-6 text-accent" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-serif font-black text-ink dark:text-parchment truncate">{data.discipline}</h3>
            <p className="text-xs text-stone-400 dark:text-[#8a7058]">
              {data.analysisCount} análise{data.analysisCount !== 1 ? 's' : ''} · {data.summaries.length} abstracts gerados
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Painel: tamanho médio dos abstracts por IA */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconChartPie className="w-5 h-5 text-accent" />
            <h4 className="font-serif font-black text-ink dark:text-parchment">
              Tamanho médio dos abstracts por IA
            </h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="bg-stone-50/50 dark:bg-white/2 rounded-2xl border border-stone-200 dark:border-white/5 p-6 flex items-center justify-center">
              <PieChart data={pieData} unit=" palavras" />
            </div>

            {/* Média geral: IA vs. Originais dos DOIs */}
            <div className="bg-stone-50/50 dark:bg-white/2 rounded-2xl border border-stone-200 dark:border-white/5 p-6 flex flex-col gap-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40">
                Média geral: IA vs. Originais
              </p>

              {data.originalCount === 0 ? (
                <p className="text-sm text-stone-400 dark:text-[#8a7058] my-auto text-center">
                  Sem abstracts originais registrados para esta disciplina.
                </p>
              ) : (
                <div className="flex flex-col gap-6 justify-center flex-1">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-bold text-ink dark:text-parchment">Gerados por IA</span>
                      <span className="text-lg font-serif font-black text-blue-600 dark:text-blue-400">
                        {avgAi} <span className="text-xs uppercase font-sans text-stone-400 dark:text-[#8a7058]">palavras</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(avgAi / maxAvg) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 dark:text-[#8a7058] font-bold">
                      {aiTotalCount} abstract{aiTotalCount !== 1 ? 's' : ''} gerado{aiTotalCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-bold text-ink dark:text-parchment">Originais (DOIs)</span>
                      <span className="text-lg font-serif font-black text-accent">
                        {avgOriginal} <span className="text-xs uppercase font-sans text-stone-400 dark:text-[#8a7058]">palavras</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(avgOriginal / maxAvg) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 dark:text-[#8a7058] font-bold">
                      {data.originalCount} abstract{data.originalCount !== 1 ? 's' : ''} autêntico{data.originalCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="border-t border-stone-100 dark:border-white/5 pt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 dark:text-[#9a8070]">Diferença (IA − Originais)</span>
                    <span className={`text-sm font-black ${diff > 0 ? 'text-blue-600 dark:text-blue-400' : diff < 0 ? 'text-accent' : 'text-stone-500 dark:text-[#9a8070]'}`}>
                      {diff > 0 ? '+' : ''}{diff} palavras
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel: downloads */}
        <div className="border-t border-stone-100 dark:border-white/5 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <IconPackage className="w-5 h-5 text-accent" />
            <h4 className="font-serif font-black text-ink dark:text-parchment">
              Baixar abstracts gerados (.zip)
            </h4>
          </div>
          <div className="space-y-5">
            <button
            onClick={() =>
              run('disc-all', () => downloadZip(data.summaries, `abstracts_${slug(data.discipline)}_todas_IAs.zip`))
            }
            disabled={!!busy}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 px-6 rounded-xl bg-accent hover:bg-[#e05f00] text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy === 'disc-all' ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconPackage className="w-4 h-4" />}
            Todos os abstracts ({data.summaries.length})
          </button>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 dark:text-[#c4b09a]/40 mb-3">
              Por IA
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presentProviders.map((p) => {
                const meta = providerMeta(p);
                const entries = data.summaries.filter((s) => s.provider === p);
                return (
                  <button
                    key={p}
                    onClick={() =>
                      run(`disc-${p}`, () => downloadZip(entries, `abstracts_${slug(data.discipline)}_${meta.label.replace(/\s+/g, '_')}.zip`))
                    }
                    disabled={!!busy}
                    className="flex items-center justify-between gap-2 text-sm font-bold py-3 px-4 rounded-xl border border-stone-200 dark:border-white/10 bg-cream dark:bg-[#1e1410] hover:bg-stone-50 dark:hover:bg-white/5 text-stone-700 dark:text-[#c4b09a] shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                      <span className="truncate">{meta.label}</span>
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0 text-xs text-stone-400 dark:text-[#8a7058]">
                      {busy === `disc-${p}` ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : <IconFileText className="w-3.5 h-3.5" />} {entries.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
