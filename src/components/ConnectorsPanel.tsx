import { useState, useEffect } from 'react';
import { Plug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useGenie } from '../lib/store';
import { connectorsApi } from '../lib/api';

const AVAILABLE = [
  { type: 'gmail',         label: 'Gmail',          desc: 'Leer y enviar correos' },
  { type: 'google_drive',  label: 'Google Drive',   desc: 'Archivos y documentos' },
  { type: 'telegram',      label: 'Telegram',       desc: 'Bot de mensajería' },
  { type: 'whatsapp',      label: 'WhatsApp',       desc: 'Mensajes y notificaciones' },
  { type: '1crm',          label: '1CRM',           desc: 'CRM y gestión de clientes' },
  { type: 'hubspot',       label: 'HubSpot',        desc: 'CRM y ventas' },
  { type: 'shopify',       label: 'Shopify',        desc: 'E-commerce' },
  { type: 'zapier',        label: 'Zapier',         desc: '5,000+ integraciones' },
];

export default function ConnectorsPanel() {
  const { orgId } = useGenie();
  const [connected, setConnected] = useState<any[]>([]);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    connectorsApi.list(orgId).then((d: any) => setConnected(d || [])).catch(() => {});
  }, [orgId]);

  const connectedTypes = new Set(connected.map((c: any) => c.connector_type));

  async function handleTest(type: string) {
    setTesting(type);
    await connectorsApi.test(orgId, type).catch(() => {});
    setTesting(null);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Conectores</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Conecta Genie con tus herramientas</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {AVAILABLE.map(({ type, label, desc }) => {
            const isConnected = connectedTypes.has(type);
            return (
              <div key={type} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isConnected ? 'bg-green-600/20' : 'bg-zinc-800'}`}>
                    <Plug size={15} className={isConnected ? 'text-green-400' : 'text-zinc-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-zinc-500">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <CheckCircle size={15} className="text-green-400" />
                      <button
                        onClick={() => handleTest(type)}
                        disabled={testing === type}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {testing === type ? <RefreshCw size={13} className="animate-spin" /> : 'Probar'}
                      </button>
                    </>
                  ) : (
                    <button className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
