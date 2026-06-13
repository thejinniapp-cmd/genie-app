import { useState, useEffect } from 'react';
import { BarChart2, Bot, Plug, CheckSquare, Clock } from 'lucide-react';
import { useGenie } from '../lib/store';
import { dashboardApi } from '../lib/api';

export default function DashboardPanel() {
  const { orgId } = useGenie();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    dashboardApi.getMetrics(orgId).then(setMetrics).catch(() => {});
  }, [orgId]);

  const cards = [
    { label: 'Streams activos',   value: metrics?.streams ?? '—',        icon: BarChart2, color: 'text-violet-400' },
    { label: 'Agentes',           value: metrics?.agents ?? '—',         icon: Bot,       color: 'text-blue-400' },
    { label: 'Jobs completados',  value: metrics?.jobs_approved ?? '—',  icon: CheckSquare, color: 'text-green-400' },
    { label: 'Pendientes',        value: metrics?.jobs_pending ?? '—',   icon: Clock,     color: 'text-yellow-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Estado general de tu organización</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">{label}</p>
                <Icon size={15} className={color} />
              </div>
              <p className="text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">Conectores activos</p>
          <div className="flex items-center gap-2">
            <Plug size={13} className="text-zinc-600" />
            <p className="text-xs text-zinc-500">Configura conectores para ver su estado aquí</p>
          </div>
        </div>
      </div>
    </div>
  );
}
