import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useGenie } from '../lib/store';
import { jobsApi, dashboardApi } from '../lib/api';

const statusIcon: Record<string, any> = {
  completed: <CheckCircle size={13} className="text-green-400" />,
  failed:    <XCircle size={13} className="text-red-400" />,
  pending:   <Clock size={13} className="text-zinc-500" />,
  running:   <Loader2 size={13} className="text-yellow-400 animate-spin" />,
  waiting_approval: <AlertTriangle size={13} className="text-orange-400" />,
};

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `hace ${Math.round(diff)}s`;
  if (diff < 3600) return `hace ${Math.round(diff / 60)}m`;
  return `hace ${Math.round(diff / 3600)}h`;
}

export default function ActivityPanel() {
  const { orgId, activeStream } = useGenie();
  const [jobs, setJobs] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [tab, setTab] = useState<'jobs' | 'audit'>('jobs');

  useEffect(() => {
    if (!activeStream) return;
    jobsApi.list(orgId, activeStream.id).then((d: any) => setJobs(d || [])).catch(() => {});
    dashboardApi.getAuditLog(orgId, activeStream.id, 50).then((d: any) => setAudit(d || [])).catch(() => {});
  }, [activeStream?.id]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Actividad</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Logs y auditoría del stream</p>
        </div>

        <div className="flex gap-2 mb-4">
          {(['jobs', 'audit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors capitalize ${tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {t === 'jobs' ? 'Jobs' : 'Auditoría'}
            </button>
          ))}
        </div>

        {tab === 'jobs' && (
          <div className="space-y-2">
            {jobs.length === 0 && <p className="text-sm text-zinc-600">Sin actividad en este stream</p>}
            {jobs.map((j: any) => (
              <div key={j.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[j.status] || statusIcon.pending}
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{j.agent_type}</p>
                    {j.error && <p className="text-xs text-red-400 mt-0.5">{j.error}</p>}
                  </div>
                </div>
                <p className="text-xs text-zinc-600">{timeAgo(j.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-2">
            {audit.length === 0 && <p className="text-sm text-zinc-600">Sin entradas de auditoría</p>}
            {audit.map((a: any) => (
              <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-200">{a.action}</p>
                  <p className="text-xs text-zinc-600">{timeAgo(a.created_at)}</p>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{a.actor_type} · {a.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
