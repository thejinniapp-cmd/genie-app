import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getUserOrg } from './lib/auth';
import type { Session } from '@supabase/supabase-js';

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
import Login from './pages/Login';
import { useMessages } from './hooks/useMessages';
import { useRFQ } from './hooks/useRFQ';

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

type AppState = 'loading' | 'login' | 'onboarding' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    // Listen for auth changes FIRST (before checking session)
    // This catches the OAuth redirect token exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event, 'session:', !!session);
      if (event === 'SIGNED_IN' && session) {
        checkOrgState();
      } else if (event === 'SIGNED_OUT') {
        setAppState('login');
      }
    });

    // Also check current session (for page reloads)
    checkAuthState();

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuthState() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setAppState('login');
      return;
    }
    await checkOrgState();
  }

  async function checkOrgState() {
    try {
      const userOrg = await getUserOrg();
      if (!userOrg) {
        // No org yet — trigger will create it shortly, wait briefly
        await new Promise(r => setTimeout(r, 1000));
        const retry = await getUserOrg();
        if (!retry) {
          setAppState('onboarding');
          return;
        }
        const org = (retry as any).organizations;
        setAppState(org?.status === 'onboarding' ? 'onboarding' : 'app');
        return;
      }
      const org = (userOrg as any).organizations;
      setAppState(org?.status === 'onboarding' ? 'onboarding' : 'app');
    } catch {
      setAppState('onboarding');
    }
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-bold text-white">✦ Genie</div>
          <div className="w-5 h-5 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (appState === 'login') {
    return <Login />;
  }

  if (appState === 'onboarding') {
    return <OnboardingFlow onComplete={() => setAppState('app')} />;
  }

  return (
    <GenieProvider>
      <WorkstationLayout />
    </GenieProvider>
  );
}
