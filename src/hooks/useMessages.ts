/**
 * Hook para gestión de mensajes de un stream.
 * Extraído de App.tsx para mantenerlo limpio.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadMessages, persistMessages, loadMessagesFromCache, saveMessagesToCache } from '../lib/storage';
import type { Message } from '../lib/types';

export function useMessages(activeStreamId: string) {
  const [messages, setMessagesRaw] = useState<Message[]>([]);

  useEffect(() => {
    let cancelled = false;
    const cached = loadMessagesFromCache(activeStreamId);
    if (cached.length > 0) {
      setMessagesRaw(prev => {
        const ids = new Set(prev.map(m => m.id));
        const newMsgs = cached.filter(m => !ids.has(m.id));
        return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
      });
    }
    loadMessages(activeStreamId).then(loaded => {
      if (!cancelled && loaded.length > 0) {
        setMessagesRaw(prev => {
          const ids = new Set(prev.map(m => m.id));
          const newMsgs = loaded.filter(m => !ids.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      }
    });
    return () => { cancelled = true; };
  }, [activeStreamId]);

  const setMessages: typeof setMessagesRaw = useCallback((action) => {
    setMessagesRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      const widgetLast = new Map<string, number>();
      const decisionFirst = new Map<string, number>();
      for (let i = 0; i < next.length; i++) {
        const c = next[i].contenido as any;
        if (next[i].tipo === 'widget' && c?.rfq_id) widgetLast.set(c.rfq_id, i);
        if (next[i].tipo === 'decision' && c?.rfq_id && !decisionFirst.has(c.rfq_id)) decisionFirst.set(c.rfq_id, i);
      }
      const deduped = next.filter((m, i) => {
        const c = m.contenido as any;
        if (m.tipo === 'widget' && c?.rfq_id && widgetLast.get(c.rfq_id) !== i) return false;
        if (m.tipo === 'decision' && c?.rfq_id && decisionFirst.get(c.rfq_id) !== i) return false;
        return true;
      });
      const toPersist = deduped.filter(m => !prev.find(p => p.id === m.id));
      if (toPersist.length > 0) {
        persistMessages(toPersist);
        const sid = toPersist[0]?.stream_id;
        if (sid) saveMessagesToCache(sid, deduped.filter(m => m.stream_id === sid));
      }
      return deduped;
    });
  }, []);

  function pushLog(msg: string, type: 'ok' | 'warn' | 'error' = 'ok') {
    if (!activeStreamId) return;
    supabase.from('stream_logs').insert({ stream_id: activeStreamId, msg, type }).then(() => {});
  }

  return { messages, setMessages, pushLog };
}
