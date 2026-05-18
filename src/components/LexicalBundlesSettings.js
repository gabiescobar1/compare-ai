'use client';

import React, { useState, useRef } from 'react';
import { useLexicalBundles } from '@/contexts/LexicalBundlesContext';
import { IconSettings, IconCheck, IconUpload, IconFileSpreadsheet, IconTrash } from '@tabler/icons-react';
import * as XLSX from 'xlsx';

export default function LexicalBundlesSettings() {
  const { bundles, setBundles } = useLexicalBundles();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Convert to array of arrays
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const newBundles = {};
        let currentDiscipline = 'Geral';

        data.forEach(row => {
          if (!row || row.length === 0) return;
          const cellValue = String(row[0]).trim();
          
          if (!cellValue) return;

          if (cellValue.startsWith('*')) {
            currentDiscipline = cellValue.substring(1).trim();
            if (!newBundles[currentDiscipline]) {
              newBundles[currentDiscipline] = [];
            }
          } else {
            if (!newBundles[currentDiscipline]) {
              newBundles[currentDiscipline] = [];
            }
            newBundles[currentDiscipline].push(cellValue);
          }
        });

        // Filter out empty disciplines
        for (const key in newBundles) {
          if (newBundles[key].length === 0) {
            delete newBundles[key];
          }
        }

        setBundles(newBundles);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error("Erro ao ler arquivo excel", err);
        alert("Erro ao ler o arquivo Excel. Verifique se o formato está correto.");
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const clearBundles = () => {
    if (confirm("Tem certeza que deseja limpar todos os Lexical Bundles?")) {
      setBundles({});
    }
  };

  const disciplines = Object.keys(bundles || {});
  const totalBundles = disciplines.reduce((acc, curr) => acc + bundles[curr].length, 0);

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1008]/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
        <IconSettings className="w-4 h-4" /> Lexical Bundles
      </h2>
      <div className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">Importar Lexical Bundles (Excel)</p>
          <p className="text-xs text-[#1C1008]/60 dark:text-[#9a8070] mt-1">
            Envie um arquivo Excel (.xlsx ou .xls) contendo os seus lexical bundles na primeira coluna. 
            Para dividir por disciplinas, coloque um asterisco antes do nome da disciplina (ex: <strong>*Antropologia</strong>). 
            Os itens abaixo dele pertencerão a ela.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload} 
            className="hidden" 
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold py-3 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#3a2a1e] dark:hover:bg-[#4a3a2e] text-[#1C1008] dark:text-[#f0e4d4] transition-colors border border-stone-200 dark:border-white/10"
          >
            <IconFileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            Escolher arquivo Excel
          </button>
          
          {saved && (
             <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
               <IconCheck className="w-4 h-4" /> Importado!
             </span>
          )}
        </div>

        {totalBundles > 0 && (
          <div className="mt-2 border-t border-stone-100 dark:border-white/5 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#1C1008]/40 dark:text-[#c4b09a]/40">
                Bundles Carregados ({totalBundles})
              </span>
              <button onClick={clearBundles} className="text-red-500 hover:text-red-600 p-1" title="Limpar tudo">
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {disciplines.map(disc => (
                <div key={disc} className="bg-stone-50 dark:bg-[#1a0e08] border border-stone-100 dark:border-white/5 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-700 dark:text-[#c4b09a] truncate pr-2">{disc}</span>
                  <span className="text-[10px] font-black bg-[#ff6b00]/10 text-[#ff6b00] px-2 py-1 rounded-full whitespace-nowrap">
                    {bundles[disc].length} itens
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
