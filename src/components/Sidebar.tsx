import { MessageSquare, Bot, Plug, BookOpen, BarChart2, Settings, Activity } from 'lucide-react';
import { useGenie } from '../lib/store';

const NAV = [
  { id: 'chat',       icon: MessageSquare, label: 'Chat',        desc: 'Habla con Genie' },
  { id: 'agents',     icon: Bot,           label: 'Agentes',     desc: 'Configura tu equipo' },
  { id: 'connectors', icon: Plug,          label: 'Conectores',  desc: 'APIs y herramientas' },
  { id: 'rag',        icon: BookOpen,      label: 'Conocimiento',desc: 'Fuentes y contexto' },
  { id: 'dashboard',  icon: BarChart2,     label: 'Dashboard',   desc: 'Métricas y KPIs' },
  { id: 'activity',   icon: Activity,      label: 'Actividad',   desc: 'Logs y auditoría' },
  { id: 'settings',   icon: Settings,      label: 'Config',      desc: 'Ajustes del stream' },
];

export default function Sidebar() {
  const { activeNav, setActiveNav } = useGenie();

  return (
    <div className="w-14 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveNav(id)}
          title={label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            activeNav === id
              ? 'bg-violet-600 text-white'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}
