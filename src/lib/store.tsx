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

// IDs demo — se reemplazan con auth real en producción
const DEMO_ORG_ID = 'demo-org-001';
const DEMO_STREAM_1 = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DEMO_STREAM_2 = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const DEMO_STREAMS: Stream[] = [
  {
    id: DEMO_STREAM_1,
    name: 'RFQ · MRO Master',
    nombre: 'RFQ · MRO Master',
    type: 'rfq',
    tipo: 'compras',
    status: 'active',
    config: {},
    created_at: new Date().toISOString(),
  },
  {
    id: DEMO_STREAM_2,
    name: 'APQP · Cliente 2',
    nombre: 'APQP · Cliente 2',
    type: 'general',
    tipo: 'general',
    status: 'active',
    config: {},
    created_at: new Date().toISOString(),
  },
];

export function GenieProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>({
    id: DEMO_ORG_ID,
    name: 'MRO Master Pro',
    slug: 'mro-master-pro',
    plan: 'pro',
    status: 'active',
    created_at: new Date().toISOString(),
  });
  const [streams, setStreams] = useState<Stream[]>(DEMO_STREAMS);
  const [activeStreamId, setActiveStreamId] = useState(DEMO_STREAM_1);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<StreamNotification[]>([]);
  const [activeNav, setActiveNav] = useState('new-rfq');
  const [loading, setLoading] = useState(false);

  const orgId = org?.id || DEMO_ORG_ID;
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
