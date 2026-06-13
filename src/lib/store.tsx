/**
 * Context global de Genie.
 * Carga org y streams dinámicamente desde Supabase Auth.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import type { Organization, Stream, User, StreamNotification } from './types';

interface GenieStore {
  org: Organization | null;
  orgId: string;
  setOrg: (org: Organization) => void;
  streams: Stream[];
  activeStreamId: string;
  activeStream: Stream | null;
  setActiveStreamId: (id: string) => void;
  setStreams: (streams: Stream[]) => void;
  addStream: (stream: Stream) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  notifications: StreamNotification[];
  pendingCount: number;
  dismissNotification: (id: string) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const GenieContext = createContext<GenieStore | null>(null);

export function GenieProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<StreamNotification[]>([]);
  const [activeNav, setActiveNav] = useState('stream');
  const [loading, setLoading] = useState(true);

  const orgId = org?.id || '';
  const activeStream = streams.find(s => s.id === activeStreamId) || null;
  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  // Cargar org y streams del usuario autenticado
  useEffect(() => {
    loadUserContext();
  }, []);

  async function loadUserContext() {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      // Cargar org del usuario
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('org_id, role, organizations(*)')
        .eq('user_id', authUser.id)
        .single();

      if (!userOrg) { setLoading(false); return; }

      const orgData = (userOrg as any).organizations;
      setOrg({
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug || '',
        plan: orgData.plan || 'starter',
        status: orgData.status,
        created_at: orgData.created_at,
      });

      // Cargar streams de la org
      const { data: streamsData } = await supabase
        .from('streams')
        .select('*')
        .eq('org_id', orgData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (streamsData && streamsData.length > 0) {
        const mapped: Stream[] = streamsData.map((s: any) => ({
          id: s.id,
          name: s.name || s.nombre || 'Stream',
          nombre: s.name || s.nombre || 'Stream',
          type: s.type || 'general',
          tipo: s.type || 'general',
          status: s.status,
          config: s.config || {},
          created_at: s.created_at,
        }));
        setStreams(mapped);
        setActiveStreamId(mapped[0].id);
      } else {
        // Crear stream inicial si no existe
        const { data: newStream } = await supabase
          .from('streams')
          .insert({ org_id: orgData.id, name: 'Stream Principal', type: 'general', status: 'active', config: {} })
          .select()
          .single();

        if (newStream) {
          const s: Stream = {
            id: newStream.id,
            name: 'Stream Principal',
            nombre: 'Stream Principal',
            type: 'general',
            tipo: 'general',
            status: 'active',
            config: {},
            created_at: newStream.created_at,
          };
          setStreams([s]);
          setActiveStreamId(s.id);
        }
      }
    } catch (err) {
      console.error('[Store] Error loading context:', err);
    } finally {
      setLoading(false);
    }
  }

  // Notificaciones en tiempo real
  useEffect(() => {
    if (!orgId) return;
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
  }, [orgId]);

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
