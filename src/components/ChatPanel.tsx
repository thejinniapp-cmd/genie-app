import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useGenie } from '../lib/store';
import { streamsApi } from '../lib/api';
import { supabase } from '../lib/supabase';

interface Msg { id: string; role: string; content: any; created_at: string; }

export default function ChatPanel() {
  const { orgId, activeStream } = useGenie();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar historial al cambiar de stream
  useEffect(() => {
    if (!activeStream) return;
    setMessages([]);
    streamsApi.getMessages(orgId, activeStream.id).then((data: any) => {
      setMessages(data || []);
    }).catch(() => {});
  }, [activeStream?.id]);

  // Realtime: escuchar nuevos mensajes del agente
  useEffect(() => {
    if (!activeStream) return;
    const channel = supabase
      .channel(`messages-${activeStream.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `stream_id=eq.${activeStream.id}`,
      }, (payload) => {
        const msg = payload.new as Msg;
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.role === 'assistant') setWaiting(false);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeStream?.id]);

  // Scroll al fondo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, waiting]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !activeStream || sending) return;
    setInput('');
    setSending(true);
    setWaiting(true);

    // Optimistic: mostrar el mensaje del usuario de inmediato
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, role: 'user',
      content: { type: 'text', text },
      created_at: new Date().toISOString(),
    }]);

    try {
      await streamsApi.postMessage(orgId, activeStream.id, {
        role: 'user',
        content: { type: 'text', text },
      });
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setWaiting(false);
    } finally {
      setSending(false);
    }
  }

  function getText(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'object') return content.text || JSON.stringify(content);
    return String(content);
  }

  if (!activeStream) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
        Selecciona o crea un stream para empezar
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <p className="text-sm font-medium text-white">{activeStream.name}</p>
        <p className="text-xs text-zinc-500 capitalize">{activeStream.type} · {activeStream.status}</p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 text-sm pt-8">
            Escríbele a Genie para empezar
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                G
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-br-sm'
                : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
            }`}>
              {getText(msg.content)}
            </div>
          </div>
        ))}
        {waiting && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
              G
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 size={14} className="text-zinc-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-zinc-800 flex-shrink-0">
        <div className="flex items-end gap-2 bg-zinc-800 rounded-xl px-4 py-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Escríbele a Genie...`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none max-h-32"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="text-violet-400 hover:text-violet-300 disabled:text-zinc-600 transition-colors mb-0.5"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-1.5 text-center">El agente responde en ~10 segundos</p>
      </div>
    </div>
  );
}
