'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import ResultsComparison from '@/components/ResultsComparison';
import { IconBook, IconSearch, IconChecklist, IconTrash, IconX } from '@tabler/icons-react';
import { DISCIPLINES } from '@/constants/Disciplines';
import { deleteHistoryRecord, deleteHistoryRecords } from '@/app/actions';

export default function HistoryClient({ analyses }) {
  const [filter, setFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Registro apontado por um link externo (?focus=<id>): rola, expande e destaca.
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('focus');
    if (!f) return;
    // Tudo dentro do timeout: assim, sob React Strict Mode (dev), a limpeza da
    // 1ª execução cancela antes de mexer na URL, e a 2ª ainda lê o ?focus=.
    const scrollT = setTimeout(() => {
      setFocusId(f);
      document.getElementById(`analysis-${f}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Limpa a URL para não re-focar ao recarregar.
      window.history.replaceState(null, '', window.location.pathname);
    }, 120);
    // Remove o destaque depois de alguns segundos (o registro segue expandido).
    const clearT = setTimeout(() => setFocusId(null), 3600);
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
  }, []);

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta análise do histórico?')) {
      setDeletedIds(prev => new Set(prev).add(id));
      startTransition(async () => {
        await deleteHistoryRecord(id);
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const activeAnalyses = analyses.filter(a => !deletedIds.has(a.id));

  // Média de palavras dos abstracts (original + IAs) por disciplina.
  const disciplineAverages = useMemo(() => {
    const acc = {};
    const countWords = (t) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);
    analyses.forEach(a => {
      const disc = a.discipline;
      if (!acc[disc]) acc[disc] = { words: 0, count: 0 };
      const ow = countWords(a.originalAbstract);
      if (ow > 0) { acc[disc].words += ow; acc[disc].count += 1; }
      (a.summaries || []).forEach(s => {
        if (s.content && !s.content.includes('ERRO')) {
          const w = countWords(s.content);
          if (w > 0) { acc[disc].words += w; acc[disc].count += 1; }
        }
      });
    });
    const map = {};
    Object.entries(acc).forEach(([d, v]) => {
      map[d] = v.count > 0 ? Math.round(v.words / v.count) : 0;
    });
    return map;
  }, [analyses]);

  // Realiza o filtro localmente (ex: se filter = 'Ant', manter só item.discipline === 'Ant') e por DOI
  const filteredAnalyses = activeAnalyses.filter(a => {
    const matchesDiscipline = filter ? a.discipline === filter : true;
    const matchesSearch = searchQuery 
      ? a.doi?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDiscipline && matchesSearch;
  });

  const allVisibleSelected = filteredAnalyses.length > 0 && filteredAnalyses.every(a => selectedIds.has(a.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredAnalyses.forEach(a => next.delete(a.id));
      } else {
        filteredAnalyses.forEach(a => next.add(a.id));
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Excluir ${ids.length} análise(s) do histórico? Esta ação não pode ser desfeita.`)) return;
    setDeletedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
    startTransition(async () => {
      await deleteHistoryRecords(ids);
    });
    exitSelectMode();
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Campo de pesquisa por DOI */}
        <div className="relative w-full sm:w-1/2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <IconSearch className="w-5 h-5 text-stone-600" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por DOI..."
            className="w-full bg-cream dark:bg-paper-dark text-stone-800 dark:text-parchment border border-stone-300 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-accent focus:outline-none transition shadow-sm font-medium placeholder-stone-400 dark:placeholder-[#8a7058]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Seletor de disciplinas */}
        <div className="relative w-full sm:w-1/2">
          <select 
            className="w-full bg-cream dark:bg-paper-dark text-stone-800 dark:text-parchment border border-stone-300 dark:border-white/10 rounded-2xl p-3 focus:ring-2 focus:ring-accent focus:outline-none transition appearance-none cursor-pointer font-bold shadow-sm"
            value={filter || ''}
            onChange={(e) => setFilter(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">Todas as Disciplinas</option>
            {DISCIPLINES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      
      {/* Barra de seleção em lote */}
      {activeAnalyses.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-end gap-2">
          {!selectMode ? (
            <button
              onClick={() => setSelectMode(true)}
              className="flex items-center gap-2 text-sm font-bold py-2 px-4 rounded-xl border border-stone-300 dark:border-white/10 bg-cream dark:bg-paper-dark text-stone-700 dark:text-[#c4b09a] hover:border-accent hover:text-accent transition-all"
            >
              <IconChecklist className="w-4 h-4" /> Selecionar
            </button>
          ) : (
            <>
              <span className="text-sm font-bold text-stone-600 dark:text-[#c4b09a] mr-1">
                {selectedIds.size} selecionada(s)
              </span>
              <button
                onClick={toggleSelectAllVisible}
                className="text-sm font-bold py-2 px-4 rounded-xl border border-stone-300 dark:border-white/10 bg-cream dark:bg-paper-dark text-stone-700 dark:text-[#c4b09a] hover:border-accent hover:text-accent transition-all"
              >
                {allVisibleSelected ? 'Limpar seleção' : 'Selecionar todas'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 text-sm font-bold py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconTrash className="w-4 h-4" /> Excluir selecionadas ({selectedIds.size})
              </button>
              <button
                onClick={exitSelectMode}
                className="flex items-center gap-2 text-sm font-bold py-2 px-4 rounded-xl border border-stone-300 dark:border-white/10 bg-cream dark:bg-paper-dark text-stone-700 dark:text-[#c4b09a] hover:border-stone-400 transition-all"
              >
                <IconX className="w-4 h-4" /> Cancelar
              </button>
            </>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto space-y-12">
        {filteredAnalyses.length === 0 ? (
           <div className="text-center border border-stone-200 dark:border-white/8 bg-cream dark:bg-paper-dark rounded-3xl p-12 text-stone-500 dark:text-[#9a8070] font-medium max-w-2xl mx-auto shadow-sm">
              <IconBook className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-paper-dark" />
              {activeAnalyses.length === 0 
                ? "Não existem análises registradas no histórico."
                : `Nenhum registro encontrado para os filtros selecionados.`}
           </div>
        ) : (
           filteredAnalyses.map(item => (
              <ResultsComparison
                key={item.id}
                data={item}
                onDelete={handleDelete}
                defaultExpanded={false}
                disciplineAvg={disciplineAverages[item.discipline] || 0}
                selectable={selectMode}
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
                highlighted={String(item.id) === String(focusId)}
              />
           ))
        )}
      </main>
    </>
  );
}
