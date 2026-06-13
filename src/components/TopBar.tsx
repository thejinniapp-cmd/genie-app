import { Plus, Zap } from 'lucide-react';
import { useGenie } from '../lib/store';

interface Props { onNewStream: () => void; }

export default function TopBar({ onNewStream }: Props) {
  const { streams, activeStreamId, setActiveStreamId } = useGenie();

  return (
    <div className="h-11 bg-zinc-950 border-b border-zinc-800 flex items-center px-3 gap-2 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-3">
        <Zap size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">Genie</span>
      </div>

      {/* Stream tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {streams.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveStreamId(s.id)}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              s.id === activeStreamId
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {s.name}
          </button>
        ))}
        <button
          onClick={onNewStream}
          className="flex items-center gap-1 px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded text-xs transition-colors"
        >
          <Plus size={12} /> Nuevo stream
        </button>
      </div>
    </div>
  );
}
