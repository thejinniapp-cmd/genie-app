import { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUserOrg } from '../../lib/auth';

interface ChatMsg {
  role: 'assistant' | 'user';
  content: string;
}

interface OrgData {
  nombre_empresa: string;
  giro: string;
  num_empleados: string;
  herramientas: string[];
  consultor_ref: string;
  onboarding_complete: boolean;
}

const ONBOARDING_SYSTEM = `Eres Genie, un asistente de IA que está ayudando a un nuevo cliente a configurar su cuenta.

Tu objetivo es recopilar la siguiente información de forma conversacional y amigable, una pregunta a la vez:
1. Nombre de la empresa
2. Giro o industria (a qué se dedican)
3. Número aproximado de empleados
4. Herramientas tecnológicas que utilizan (CRM, ERP, Gmail, WhatsApp, plataformas de e-commerce, etc.)
5. Si tienen un consultor de Genie que los refirió (preguntar su nombre o email)

Una vez que tengas toda la información, genera un resumen y pregunta si está correcto. Cuando confirmen, responde EXACTAMENTE con este JSON (sin markdown, sin texto extra):
{"accion":"onboarding_completo","nombre_empresa":"...","giro":"...","num_empleados":"...","herramientas":["..."],"consultor_ref":"..."}

Reglas:
- Sé amigable, profesional y conciso
- Haz una pregunta a la vez
- Si mencionan herramientas, pregunta cuáles específicamente
- Para conectores, solo recopila los nombres — después Claude los guiará sobre cómo conectarlos
- Habla en español`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: '¡Hola! Soy Genie 👋 Estoy aquí para ayudarte a configurar tu cuenta. Vamos a tardar solo unos minutos.\n\n¿Cuál es el nombre de tu empresa?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const newMsgs: ChatMsg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      // Call backend which calls Claude
      const res = await fetch(`${API_URL}/api/onboarding/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          system: ONBOARDING_SYSTEM,
        }),
      });

      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      const reply: string = data.response || '';

      // Check if onboarding is complete
      if (reply.includes('"accion":"onboarding_completo"')) {
        try {
          const json: OrgData = JSON.parse(reply);
          await saveOrgData(json);
          return;
        } catch { /* not valid json yet, show as text */ }
      }

      setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Hubo un error de conexión. ¿Puedes intentar de nuevo?' }]);
    } finally {
      setLoading(false);
    }
  }

  async function saveOrgData(data: OrgData) {
    setSaving(true);
    try {
      const userOrg = await getUserOrg();
      if (!userOrg?.org_id) throw new Error('No org found');

      // Update org with onboarding data
      await supabase
        .from('organizations')
        .update({
          name: data.nombre_empresa,
          metadata: {
            giro: data.giro,
            num_empleados: data.num_empleados,
            herramientas: data.herramientas,
            consultor_ref: data.consultor_ref,
          },
          status: 'active',
        })
        .eq('id', userOrg.org_id);

      // Create pending connectors for each tool mentioned
      if (data.herramientas?.length > 0) {
        const connectors = data.herramientas.map(h => ({
          org_id: userOrg.org_id,
          name: h,
          type: h.toLowerCase().replace(/\s+/g, '_'),
          status: 'pending_setup',
          config: {},
        }));
        await supabase.from('connectors').insert(connectors);
      }

      setMsgs(prev => [...prev, {
        role: 'assistant',
        content: `¡Perfecto! Tu cuenta de **${data.nombre_empresa}** está lista 🎉\n\nEn un momento entrarás al workstation donde podrás:\n- Ver tus conectores pendientes de configurar\n- Chatear conmigo para instrucciones de cada uno\n- Activar tus primeros agentes\n\nEntrando...`
      }]);

      setTimeout(() => {
        onComplete?.();
      }, 2500);

    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Hubo un error al guardar. Intenta de nuevo.' }]);
    } finally {
      setSaving(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">✦ Genie</div>
        <p className="text-[#555] text-sm">Configuración inicial</p>
      </div>

      {/* Chat container */}
      <div className="w-full max-w-xl flex flex-col" style={{ height: 'min(600px, 80vh)' }}>
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin"
        >
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#7F77DD] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <span className="text-white text-[11px] font-bold">✦</span>
                </div>
              )}
              <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#7F77DD] text-white rounded-br-sm'
                  : 'bg-[#141414] border border-[#1f1f1f] text-[#ddd] rounded-bl-sm'
              }`} style={{ whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {(loading || saving) && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#7F77DD] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <span className="text-white text-[11px] font-bold">✦</span>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#141414] border border-[#1f1f1f]">
                {saving ? (
                  <div className="flex items-center gap-2 text-[12px] text-[#666]">
                    <Loader className="w-3 h-3 animate-spin" />
                    Guardando tu configuración...
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-3 flex items-center gap-2 bg-[#141414] border border-[#1f1f1f] rounded-2xl px-4 py-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu respuesta..."
            disabled={loading || saving}
            className="flex-1 bg-transparent text-[13px] text-white placeholder-[#444] focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || saving || !input.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#7F77DD] text-white hover:bg-[#6B63C9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
