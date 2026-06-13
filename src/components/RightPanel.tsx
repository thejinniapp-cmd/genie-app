import { useState, useEffect } from 'react';
import { Bot, Plug, Activity, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { useGenie } from '../lib/store';
import { agentsApi, connectorsApi, jobsApi } from '../lib/api';

export default function RightPanel() {
  const { orgId, activeStream } = useGenie();
  const [agents, setAgents] = useState<any[]>([]);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [openSection, setOpenSection] = useState<string>('agents');

  useEffect(() => {
    if (!activeStream) return;
    agentsApi.list(orgId, activeStream.id).then((d: any) => setAgents(d || [])).catch(() => {});
    connectorsApi.list(orgId).then((d: any) => setConnectors(d || [])).catch(() => {});
    jobsApi.list(orgId, activeStream.id).then((d: any) => setRecentJobs((d || []).slice(0, 8))).catch(() => {});
  }, [activeStream?.id]);

  function toggle(s: string) { setOpenSection(prev => prev === s ? '' : s); }

  const statusColor: Record<string, string> = {
    completed: 'text-green-400', running: 'text-yellow-400',
    failed: 'text-red-400', pending: 'text-zinc-400',
    waiting_approval: 'text-orange-400',
  };

  return (
    <div className="w-64 bg-zinc-950 border-l border-zinc-800 flex flex-col overflow-y-auto flex-shrink-0">
      <div className="px-3 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {activeStream?.name || 'Sin stream'}
        </p>
      </div>

      {/* Agentes */}
      <Section label="Agentes" icon={Bot} count={agents.length} open={openSection === 'agents'} onToggle={() => toggle('agents')}>
        {agents.length === 0
          ? <p className="text-xs text-zinc-600 px-3 py-2">Sin agentes configurados</p>
          : agents.map((a: any) => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-1.5">
              <Circle size={6} className={a.is_active ? 'text-green-400 fill-green-400' : 'text-zinc-600 fill-zinc-600'} />
              <div>
                <p className="text-xs text-zinc-200">{a.name}</p>
                <p className="text-xs text-zinc-600">{a.type}</p>
              </div>
            </div>
          ))
        }
      </Section>

      {/* Conectores */}
      <Section label="Conectores" icon={Plug} count={connectors.filter((c:any) => c.status === 'connected').length} open={openSection === 'connectors'} onToggle={() => toggle('connectors')}>
        {connectors.length === 0
          ? <p className="text-xs text-zinc-600 px-3 py-2">Sin conectores activos</p>
          : connectors.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between px-3 py-1.5">
              <p className="text-xs text-zinc-200 capitalize">{c.connector_type}</p>
              <span className={`text-xs ${c.status === 'connected' ? 'text-green-400' : 'text-zinc-600'}`}>
                {c.status}
              </span>
            </div>
          ))
        }
      </Section>

      {/* Jobs recientes */}
      <Section label="Actividad reciente" icon={Activity} count={recentJobs.length} open={openSection === 'jobs'} onToggle={() => toggle('jobs')}>
        {recentJobs.length === 0
          ? <p className="text-xs text-zinc-600 px-3 py-2">Sin actividad</p>
          : recentJobs.map((j: any) => (
            <div key={j.id} className="px-3 py-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-300">{j.agent_type}</p>
                <span className={`text-xs ${statusColor[j.status] || 'text-zinc-400'}`}>{j.status}</span>
              </div>
              <p className="text-xs text-zinc-600">{new Date(j.created_at).toLocaleTimeString()}</p>
            </div>
          ))
        }
      </Section>
    </div>
  );
}

function Section({ label, icon: Icon, count, open, onToggle, children }: {
  label: string; icon: any; count: number; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-800">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-zinc-500" />
          <span className="text-xs font-medium text-zinc-300">{label}</span>
          {count > 0 && <span className="text-xs text-zinc-600">({count})</span>}
        </div>
        {open ? <ChevronDown size={12} className="text-zinc-600" /> : <ChevronRight size={12} className="text-zinc-600" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}
