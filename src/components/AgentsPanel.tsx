import { useState, useEffect } from 'react';
import { Plus, Bot, ToggleLeft, ToggleRight } from 'lucide-react';
import { useGenie } from '../lib/store';
import { agentsApi } from '../lib/api';

export default function AgentsPanel() {
  const { orgId, activeStream } = useGenie();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeStream) return;
    setLoading(true);
    agentsApi.list(orgId, activeStream.id)
      .then((d: any) => setAgents(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeStream?.id]);

  async function toggleAgent(id: string, current: boolean) {
    await agentsApi.update(orgId, id, { enabled: !current }).catch(() => {});
    setAgents(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Agentes</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Tu equipo de IA para este stream</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            <Plus size={14} /> Nuevo agente
          </button>
        </div>

        {loading && <p className="text-sm text-zinc-600">Cargando...</p>}

        {!loading && agents.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <Bot size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Sin agentes en este stream</p>
            <p className="text-xs text-zinc-600 mt-1">Crea uno o instala un skill del marketplace</p>
          </div>
        )}

        <div className="space-y-3">
          {agents.map((a: any) => (
            <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                    <Bot size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{a.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{a.type} · {a.model_id || 'modelo default'}</p>
                  </div>
                </div>
                <button onClick={() => toggleAgent(a.id, a.is_active)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                  {a.is_active ? <ToggleRight size={22} className="text-violet-400" /> : <ToggleLeft size={22} />}
                </button>
              </div>
              {a.system_prompt && (
                <p className="mt-3 text-xs text-zinc-600 line-clamp-2 border-t border-zinc-800 pt-3">
                  {a.system_prompt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
