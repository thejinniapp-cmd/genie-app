import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { streamsApi } from './api';

interface Stream { id: string; name: string; type: string; status: string; created_at: string; }
interface GenieStore {
  orgId: string;
  streams: Stream[];
  activeStreamId: string | null;
  activeStream: Stream | null;
  setActiveStreamId: (id: string) => void;
  addStream: (s: Stream) => void;
  activeNav: string;
  setActiveNav: (n: string) => void;
}

const Ctx = createContext<GenieStore | null>(null);

// Org creada en Supabase — se reemplaza con auth real
const ORG_ID = '08d459e1-8107-4d0b-b42b-43a7cd19e4e2';

export function GenieProvider({ children }: { children: ReactNode }) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('chat');

  useEffect(() => {
    streamsApi.list(ORG_ID).then((data: any) => {
      setStreams(data || []);
      if (data?.length) setActiveStreamId(data[0].id);
    }).catch(() => {});
  }, []);

  function addStream(s: Stream) {
    setStreams(prev => [...prev, s]);
    setActiveStreamId(s.id);
  }

  const activeStream = streams.find(s => s.id === activeStreamId) || null;

  return (
    <Ctx.Provider value={{ orgId: ORG_ID, streams, activeStreamId, activeStream, setActiveStreamId, addStream, activeNav, setActiveNav }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGenie() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGenie must be inside GenieProvider');
  return ctx;
}
