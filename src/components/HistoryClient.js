'use client';

import { useState, useTransition } from 'react';
import ResultsComparison from '@/components/ResultsComparison';
import { IconBook, IconSearch } from '@tabler/icons-react';
import { DISCIPLINES } from '@/constants/Disciplines';
import { deleteHistoryRecord } from '@/app/actions';

export default function HistoryClient({ analyses }) {
  const [filter, setFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletedIds, setDeletedIds] = useState(new Set());

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta análise do histórico?')) {
      setDeletedIds(prev => new Set(prev).add(id));
      startTransition(async () => {
        await deleteHistoryRecord(id);
      });
    }
  };

  const activeAnalyses = analyses.filter(a => !deletedIds.has(a.id));

  // Realiza o filtro localmente (ex: se filter = 'Ant', manter só item.discipline === 'Ant') e por DOI
  const filteredAnalyses = activeAnalyses.filter(a => {
    const matchesDiscipline = filter ? a.discipline === filter : true;
    const matchesSearch = searchQuery 
      ? a.doi?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDiscipline && matchesSearch;
  });

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Campo de pesquisa por DOI */}
        <div className="relative w-full sm:w-1/2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <IconSearch className="w-5 h-5 text-slate-600" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por DOI..."
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#ff6b00] focus:outline-none transition shadow-sm font-medium placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Seletor de disciplinas */}
        <div className="relative w-full sm:w-1/2">
          <select 
            className="w-full bg-white text-slate-800 border border-slate-300 rounded-2xl p-3 focus:ring-2 focus:ring-[#ff6b00] focus:outline-none transition appearance-none cursor-pointer font-bold shadow-sm"
            value={filter || ''}
            onChange={(e) => setFilter(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">Todas as Disciplinas</option>
            {DISCIPLINES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto space-y-12">
        {filteredAnalyses.length === 0 ? (
           <div className="text-center border border-slate-200 bg-white rounded-3xl p-12 text-slate-500 font-medium max-w-2xl mx-auto shadow-sm">
              <IconBook className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              {activeAnalyses.length === 0 
                ? "Não existem análises registradas no histórico."
                : `Nenhum registro encontrado para os filtros selecionados.`}
           </div>
        ) : (
           filteredAnalyses.map(item => (
              <ResultsComparison key={item.id} data={item} onDelete={handleDelete} />
           ))
        )}
      </main>
    </>
  );
}
