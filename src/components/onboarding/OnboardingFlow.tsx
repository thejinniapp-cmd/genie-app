import { useState } from 'react';
import { Building2, Plug, Bot, CheckCircle, ArrowRight, Loader } from 'lucide-react';

const STEPS = [
  { id: 'business', icon: Building2,   title: 'Cuéntale a Genie sobre tu negocio', subtitle: 'Genie se adapta a tu contexto' },
  { id: 'connect',  icon: Plug,        title: 'Conecta tus herramientas',           subtitle: 'Gmail, CRM, Drive y más' },
  { id: 'agents',   icon: Bot,         title: 'Genie sugiere tus primeros agentes', subtitle: 'Listo para operar' },
  { id: 'done',     icon: CheckCircle, title: '¡Listo!',                            subtitle: 'Tu equipo de IA está activo' },
];

const CONNECTOR_OPTIONS = [
  { type: 'gmail',         name: 'Gmail',         icon: '📧', category: 'Google' },
  { type: 'google_drive',  name: 'Google Drive',  icon: '📁', category: 'Google' },
  { type: 'google_sheets', name: 'Google Sheets', icon: '📊', category: 'Google' },
  { type: 'telegram',      name: 'Telegram',      icon: '✈️', category: 'Canales' },
  { type: 'whatsapp',      name: 'WhatsApp',      icon: '💬', category: 'Canales' },
  { type: 'hubspot',       name: 'HubSpot CRM',   icon: '🔶', category: 'CRM' },
  { type: '1crm',          name: '1CRM',          icon: '🔷', category: 'CRM' },
  { type: 'zapier',        name: 'Zapier',        icon: '⚡', category: 'Automatización' },
];

interface OnboardingFlowProps { onComplete?: () => void; }

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [businessDesc, setBusinessDesc] = useState('');
  const [selectedConnectors, setSelectedConnectors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  function toggleConnector(type: string) {
    setSelectedConnectors(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  async function handleContinue() {
    if (step < STEPS.length - 1) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setLoading(false);
      setStep(s => s + 1);
    } else {
      onComplete?.();
    }
  }

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="text-3xl font-bold text-white mb-2">✦ Genie</div>
          <p className="text-[#888] text-sm">El equipo que tu empresa no puede costear. Por una fracción del precio.</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-[#7F77DD] text-white' :
                i === step ? 'bg-[#7F77DD] text-white ring-2 ring-[#7F77DD] ring-offset-2 ring-offset-[#1C1C1E]' :
                'bg-[#2C2C2E] text-[#666]'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-[#7F77DD]' : 'bg-[#2C2C2E]'}`} />}
            </div>
          ))}
        </div>
        <div className="bg-[#2C2C2E] rounded-2xl p-8 border border-[#3a3a3c]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#7F77DD]/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#7F77DD]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{currentStep.title}</h2>
              <p className="text-[#666] text-sm">{currentStep.subtitle}</p>
            </div>
          </div>
          {step === 0 && (
            <div className="space-y-4">
              <textarea
                className="w-full bg-[#1C1C1E] border border-[#3a3a3c] rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-[#7F77DD] placeholder-[#555]"
                rows={5}
                placeholder="Ej: Somos una distribuidora de refacciones industriales en México. Manejamos cotizaciones de clientes, catálogo en 1CRM, y necesitamos automatizar la búsqueda de proveedores..."
                value={businessDesc}
                onChange={e => setBusinessDesc(e.target.value)}
              />
              <p className="text-[#555] text-xs">Cuanto más detallado, mejor podrá Genie configurarse para tu operación.</p>
            </div>
          )}
          {step === 1 && (
            <div>
              <p className="text-[#888] text-sm mb-4">Selecciona las herramientas que ya usas.</p>
              <div className="grid grid-cols-2 gap-2">
                {CONNECTOR_OPTIONS.map(c => (
                  <button key={c.type} onClick={() => toggleConnector(c.type)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedConnectors.has(c.type)
                        ? 'border-[#7F77DD] bg-[#7F77DD]/10 text-white'
                        : 'border-[#3a3a3c] text-[#888] hover:border-[#555]'}`}>
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-[#555]">{c.category}</div>
                    </div>
                    {selectedConnectors.has(c.type) && <CheckCircle className="w-4 h-4 text-[#7F77DD] ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[#888] text-sm mb-4">Basado en tu negocio, Genie sugiere estos agentes para arrancar:</p>
              {[
                { name: 'Agente de operaciones', desc: 'Monitorea KPIs y genera reportes diarios', icon: '📊' },
                { name: 'Agente de clientes',    desc: 'Responde consultas y gestiona seguimiento', icon: '👤' },
                { name: 'Agente de contenido',   desc: 'Mantiene tu catálogo actualizado',         icon: '📝' },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#1C1C1E] border border-[#3a3a3c]">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{a.name}</div>
                    <div className="text-[#666] text-xs">{a.desc}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-white font-medium mb-2">Tu Genie está listo</p>
              <p className="text-[#888] text-sm">Tus agentes están activos y tus herramientas conectadas.</p>
            </div>
          )}
          <button onClick={handleContinue}
            disabled={loading || (step === 0 && businessDesc.trim().length < 20)}
            className="w-full mt-6 py-3 rounded-xl bg-[#7F77DD] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#6B63C9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : (
              <>{step === STEPS.length - 1 ? 'Entrar al Workstation' : 'Continuar'}<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
