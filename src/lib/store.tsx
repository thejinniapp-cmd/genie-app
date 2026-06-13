/**
 * Context global de Genie.
 * Reemplaza el estado disperso en App.tsx.
 * Provee: org activa, stream activo, usuario, notificaciones.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import type { Organization, Stream, User, StreamNotification } from './types';

interface GenieStore {
  // Organización activa
  org: Organization | null;
  orgId: string;
  setOrg: (org: Organization) => void;

  // Streams
  streams: Stream[];
  activeStreamId: string;
  activeStream: Stream | null;
  setActiveStreamId: (id: string) => void;
  setStreams: (streams: Stream[]) => void;
  addStream: (stream: Stream) => void;

  // Usuario
  user: User | null;
  setUser: (user: User | null) => void;

  // Notificaciones pendientes (human-in-the-loop)
  notifications: StreamNotification[];
  pendingCount: number;
  dismissNotification: (id: string) => void;

  // Nav activa en sidebar
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Loading
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const GenieContext = createContext<GenieStore | null>(null);

// Org y stream reales creados en Supabase
const REAL_ORG_ID = '08d459e1-8107-4d0b-b42b-43a7cd19e4e2';
const REAL_STREAM_ID = 'f7340cf2-3720-4a66-9764-ca9d8432fdfc';

const INITIAL_STREAMS: Stream[] = [
  {
    id: REAL_STREAM_ID,
    name: 'Stream Principal',
    nombre: 'Stream Principal',
    type: 'general',
    tipo: 'general',
    status: 'active',
    config: {},
    created_at: new Date().toISOString(),
  },
];

export function GenieProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>({
    id: REAL_ORG_ID,
    name: 'Genie Test',
    slug: 'genie-test',
    plan: 'starter',
    status: 'active',
    created_at: new Date().toISOString(),
  });
  const [streams, setStreams] = useState<Stream[]>(INITIAL_STREAMS);
  const [activeStreamId, setActiveStreamId] = useState(REAL_STREAM_ID);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<StreamNotification[]>([]);
  const [activeNav, setActiveNav] = useState('new-rfq');
  const [loading, setLoading] = useState(false);

  const orgId = org?.id || REAL_ORG_ID;
  const activeStream = streams.find(s => s.id === activeStreamId) || null;
  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('stream_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_notifications',
      }, (payload) => {
        setNotifications(prev => [payload.new as StreamNotification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function addStream(stream: Stream) {
    setStreams(prev => [...prev, stream]);
    setActiveStreamId(stream.id);
  }

  function dismissNotification(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'dismissed' as const } : n)
    );
  }

  return (
    <GenieContext.Provider value={{
      org, orgId, setOrg,
      streams, activeStreamId, activeStream,
      setActiveStreamId, setStreams, addStream,
      user, setUser,
      notifications, pendingCount, dismissNotification,
      activeNav, setActiveNav,
      loading, setLoading,
    }}>
      {children}
    </GenieContext.Provider>
  );
}

export function useGenie(): GenieStore {
  const ctx = useContext(GenieContext);
  if (!ctx) throw new Error('useGenie must be used within GenieProvider');
  return ctx;
}
