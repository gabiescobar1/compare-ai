import {
  IconUser,
  IconLock,
  IconChartBar,
  IconRobot,
  IconCoin,
  IconHistory,
  IconMail,
  IconSettings,
  IconBell,
  IconShieldCheck,
} from '@tabler/icons-react';

export const metadata = {
  title: 'Minha Conta — Compare AI',
  description: 'Gerencie suas preferências e acompanhe suas análises no Compare AI.',
};

const stats = [
  { icon: IconHistory, label: 'Análises realizadas', value: '—' },
  { icon: IconRobot, label: 'Modelos utilizados', value: '—' },
  { icon: IconChartBar, label: 'Tokens consumidos', value: '—' },
  { icon: IconCoin, label: 'Custo total estimado', value: '—' },
];

const settingGroups = [
  {
    title: 'Informações da conta',
    icon: IconUser,
    items: [
      { label: 'Nome', value: 'Gabriela Escobar', editable: false },
      { label: 'E-mail', value: 'gabrielacarvalhoescobar@gmail.com', editable: false },
      { label: 'Plano', value: 'Gratuito', editable: false },
    ],
  },
  {
    title: 'Privacidade',
    icon: IconShieldCheck,
    items: [
      { label: 'Salvar histórico de análises', toggle: true, enabled: true },
    ],
  },
];

export default function MinhaContaPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Banner "Em breve" */}
        <div className="bg-[#1C1008] dark:bg-[#1a0e08] text-white rounded-2xl px-6 py-5 flex items-center gap-4 shadow-md border border-transparent dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/20 flex items-center justify-center flex-shrink-0">
            <IconLock className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-black text-sm">Sistema de login em desenvolvimento</p>
            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
              Em breve você poderá criar uma conta e acessar suas análises de qualquer dispositivo.
              Esta página está sendo preparada para essa funcionalidade.
            </p>
          </div>
          <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest bg-[#ff6b00] text-white px-3 py-1.5 rounded-full">
            Em breve
          </span>
        </div>

        {/* Profile Header */}
        <div className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#ff6b00] flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-black leading-none select-none">GE</span>
            </div>
            <span className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-stone-300 dark:bg-[#5a3e30] border-2 border-white dark:border-[#2a1c14] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-[#9a7060]" />
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-2xl font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">Gabriela Escobar</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-stone-500 dark:text-[#9a8070]">
              <IconMail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">gabrielacarvalhoescobar@gmail.com</span>
            </div>
          </div>

          {/* CTA desabilitado */}
          <button
            disabled
            title="Login disponível em breve"
            className="flex-shrink-0 flex items-center gap-2 bg-stone-100 dark:bg-[#3a2a1e] text-stone-400 dark:text-[#6a5040] text-sm font-semibold px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/8 cursor-not-allowed"
          >
            <IconLock className="w-4 h-4" />
            Entrar / Criar Conta
          </button>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1008]/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
            <IconChartBar className="w-4 h-4" /> Suas estatísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-5 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#ff6b00]" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">{stat.value}</p>
                    <p className="text-xs text-stone-500 dark:text-[#9a8070] mt-0.5 leading-snug">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 dark:text-[#6a5040] mt-3 text-center">
            Estatísticas estarão disponíveis após a implementação do sistema de login.
          </p>
        </div>

        {/* API Keys Placeholder */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1008]/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
            <IconLock className="w-4 h-4" /> Minhas Chaves de API
          </h2>
          <div className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-stone-200 dark:border-white/8 shadow-sm p-6 flex flex-col items-center text-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-[#ff6b00]/10 flex items-center justify-center">
                <IconSettings className="w-6 h-6 text-[#ff6b00]" />
             </div>
             <div className="max-w-md">
                <p className="text-sm font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">Configuração de APIs própria</p>
                <p className="text-xs text-[#1C1008]/60 dark:text-[#9a8070] mt-1">
                   Esta funcionalidade permitirá que você utilize suas próprias chaves da OpenAI, Anthropic e Google. 
                   O recurso está sendo preparado e estará disponível em breve.
                </p>
             </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1008]/60 dark:text-[#c4b09a]/60 mb-4 flex items-center gap-2">
            <IconSettings className="w-4 h-4" /> Configurações
          </h2>
          <div className="space-y-4">
            {settingGroups.map((group, gIdx) => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={gIdx}
                  className="bg-white/80 dark:bg-[#211307]/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-white/5">
                    <GroupIcon className="w-4 h-4 text-[#ff6b00]" />
                    <h3 className="text-sm font-serif font-black text-[#1C1008] dark:text-[#f0e4d4]">{group.title}</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center justify-between px-6 py-4">
                        <span className="text-sm text-slate-700 dark:text-[#c4b09a]">{item.label}</span>
                        {item.toggle !== undefined ? (
                          /* Toggle mockado */
                          <button
                            disabled
                            title="Funcionalidade disponível em breve"
                            className={`relative w-10 h-5 rounded-full transition-colors cursor-not-allowed ${
                              item.enabled ? 'bg-[#ff6b00]/40' : 'bg-slate-200 dark:bg-[#3a2a1e]'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#c4b09a] shadow transition-transform ${
                                item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-[#6a5040] font-medium">{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
