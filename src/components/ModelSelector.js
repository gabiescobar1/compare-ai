import React from 'react';
import { AI_MODELS } from '@/constants/AiModels';

export default function ModelSelector({ selectedModels, onChange, disabled }) {
  const handleChange = (provider, modelId) => {
    onChange({ ...selectedModels, [provider]: modelId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-200 pb-8">
      {Object.entries({ openai: 'OpenAI', gemini: 'Gemini', claude: 'Anthropic Claude' }).map(([key, label]) => (
        <div key={key} className="flex flex-col relative w-full">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>{label}</span>
          </label>
          <select 
            disabled={disabled}
            className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800 appearance-none disabled:opacity-50 transition-colors"
            value={selectedModels[key]}
            onChange={(e) => handleChange(key, e.target.value)}
          >
            {AI_MODELS[key.toUpperCase()].map(m => (
               <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <div className="absolute right-4 bottom-3.5 pointer-events-none opacity-50">
             <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      ))}
    </div>
  );
}
