import { GenieProvider, useGenie } from './lib/store';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import StreamArea from './components/StreamArea';
import RightPanel from './components/RightPanel';
import ConnectorsPanel from './components/ConnectorsPanel';
import AgentsPanel from './components/AgentsPanel';
import InfraPanel from './components/InfraPanel';
import DashboardPanel from './components/DashboardPanel';
import ActivityLogPanel from './components/ActivityLogPanel';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { useMessages } from './hooks/useMessages';
import { useRFQ } from './hooks/useRFQ';

// Vistas de configuración que no son streams
const CONFIG_VIEWS = ['dashboard', 'activity', 'connectors', 'agentes', 'infra'];

function WorkstationLayout() {
  const {
    streams, activeStreamId, activeStream,
    setActiveStreamId, addStream,
    activeNav, setActiveNav,
  } = useGenie();

  const { messages, setMessages, pushLog } = useMessages(activeStreamId);
  const rfq = useRFQ({ activeStreamId, messages, setMessages, pushLog });

  const isConfigView = CONFIG_VIEWS.includes(activeNav);

  function handleNavSelect(id: string) {
    setActiveNav(id);
    if (id === 'new-rfq') rfq.setRfqMode(true);
    else rfq.setRfqMode(false);
  }

  function handleCreateStream() {
    const newStream = {
      id: crypto.randomUUID(),
      name: `Stream ${streams.length + 1}`,
      nombre: `Stream ${streams.length + 1}`,
      type: 'general',
      tipo: 'general' as const,
      status: 'active' as const,
      config: {},
      created_at: new Date().toISOString(),
    };
    addStream(newStream);
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        streams={streams}
        activeStreamId={activeStreamId}
        onSelectStream={setActiveStreamId}
        onCreateStream={handleCreateStream}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar activeNav={activeNav} onNavSelect={handleNavSelect} />

        {activeNav === 'dashboard'   && <DashboardPanel />}
        {activeNav === 'activity'    && <ActivityLogPanel />}
        {activeNav === 'connectors'  && <ConnectorsPanel />}
        {activeNav === 'agentes'     && <AgentsPanel />}
        {activeNav === 'infra'       && <InfraPanel />}

        {!isConfigView && (
          <>
            <StreamArea
              stream={activeStream}
              messages={rfq.streamMessages}
              rfqMode={rfq.rfqMode}
              bulkRfqIds={rfq.bulkRfqIds}
              onActiveBulkIdChange={rfq.handleActiveBulkIdChange}
              onSendMessage={rfq.handleSendMessage}
              onRFQSubmitted={rfq.handleRFQSubmitted}
              onCloseRFQMode={() => rfq.setRfqMode(false)}
              onFileUploaded={rfq.handleFileUploaded}
              onDecision={rfq.handleDecision}
              onImagenDecision={rfq.handleImagenDecision}
              onImagenRetry={rfq.handleImagenRetry}
              onManualImageUpload={rfq.handleManualImageUpload}
              onParseConfirm={rfq.handleParseConfirm}
              onDocsConfirm={rfq.handleDocsConfirm}
              onPublicar={rfq.handlePublicar}
            />
            <RightPanel visible={true} streamId={activeStreamId} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // TODO: verificar si el org ya completó el onboarding
  // Por ahora siempre muestra el workstation
  const showOnboarding = false;

  return (
    <GenieProvider>
      {showOnboarding ? <OnboardingFlow /> : <WorkstationLayout />}
    </GenieProvider>
  );
}
