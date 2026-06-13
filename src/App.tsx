import { useState } from 'react';
import { GenieProvider, useGenie } from './lib/store';
import { streamsApi } from './lib/api';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import RightPanel from './components/RightPanel';
import AgentsPanel from './components/AgentsPanel';
import ConnectorsPanel from './components/ConnectorsPanel';
import DashboardPanel from './components/DashboardPanel';
import ActivityPanel from './components/ActivityPanel';

function App() {
  const { orgId, activeNav, addStream } = useGenie();
  const [creating, setCreating] = useState(false);

  async function handleNewStream() {
    const name = prompt('Nombre del stream:');
    if (!name) return;
    setCreating(true);
    try {
      const stream = await streamsApi.create(orgId, { name, type: 'general' }) as any;
      addStream(stream);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const centerPanel = {
    chat:       <ChatPanel />,
    agents:     <AgentsPanel />,
    connectors: <ConnectorsPanel />,
    rag:        <RAGPlaceholder />,
    dashboard:  <DashboardPanel />,
    activity:   <ActivityPanel />,
    settings:   <SettingsPlaceholder />,
  }[activeNav] ?? <ChatPanel />;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-900 overflow-hidden">
      <TopBar onNewStream={handleNewStream} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        {centerPanel}
        {activeNav === 'chat' && <RightPanel />}
      </div>
    </div>
  );
}

function RAGPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-zinc-600">
      <p className="text-sm">Conocimiento / RAG</p>
      <p className="text-xs">Próximamente — agrega fuentes de contexto para tus agentes</p>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-zinc-600">
      <p className="text-sm">Configuración</p>
      <p className="text-xs">Ajustes del stream y la organización</p>
    </div>
  );
}

export default function Root() {
  return <GenieProvider><App /></GenieProvider>;
}
