# Genie App — Workstation

Frontend de la plataforma Genie. React + TypeScript + Tailwind + Supabase.

## Estructura

```
src/
├── App.tsx                    # Layout principal limpio
├── lib/
│   ├── types.ts               # Tipos generalizados (multi-tenant)
│   ├── store.tsx              # Context global (org, streams, user)
│   ├── api.ts                 # Cliente para genie-core API
│   ├── supabase.ts            # Cliente Supabase
│   └── storage.ts             # Cache de mensajes
├── hooks/
│   ├── useMessages.ts         # Gestión de mensajes por stream
│   └── useRFQ.ts              # Lógica RFQ (extraída de App.tsx)
├── components/
│   ├── TopBar.tsx             # Barra superior con tabs de streams
│   ├── Sidebar.tsx            # Navegación lateral
│   ├── StreamArea.tsx         # Área central de chat/stream
│   ├── RightPanel.tsx         # Panel derecho (logs, agentes, fuentes)
│   ├── ConnectorsPanel.tsx    # Gestión de conectores
│   ├── AgentsPanel.tsx        # Configuración de agentes
│   ├── InfraPanel.tsx         # Infraestructura
│   ├── DashboardPanel.tsx     # Dashboard y KPIs
│   ├── ActivityLogPanel.tsx   # Audit log
│   └── onboarding/
│       └── OnboardingFlow.tsx # Flujo de onboarding para nuevos usuarios
└── pages/                     # Páginas adicionales (portal externo, etc.)
```

## Inicio rápido

```bash
npm install
cp .env.example .env
# Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Conexión con genie-core

El frontend se comunica con el backend Python via `src/lib/api.ts`.
Configurar `VITE_API_URL` en `.env` apuntando a tu instancia de genie-core.
