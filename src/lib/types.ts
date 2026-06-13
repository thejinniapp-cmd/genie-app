// ── Organización / Tenant ─────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  created_at: string;
}

export interface OrgConfig {
  org_id: string;
  default_model: string;
  fast_model: string;
  autonomy_global: 'manual' | 'supervised' | 'autonomous';
  timezone: string;
  language: string;
  settings: Record<string, unknown>;
}

// ── Usuario ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  stream_access: string[]; // vacío = acceso a todos
}

export interface ExternalUser {
  id: string;
  org_id: string;
  email?: string;
  name?: string;
  type: 'client' | 'supplier' | 'prospect' | 'partner';
  phone?: string;
}

// ── Streams ───────────────────────────────────────────────────────────────────

export interface Stream {
  id: string;
  org_id?: string;
  name: string;           // antes: nombre
  description?: string;
  type: string;           // general | sales | support | ops | rfq | apqp | custom
  status: 'active' | 'paused' | 'archived';
  config: Record<string, unknown>;
  created_at: string;
  // legacy compat
  nombre?: string;
  tipo?: string;
}

// ── Mensajes ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  stream_id: string;
  rol: 'user' | 'assistant' | 'system' | 'agent';
  tipo: MessageType;
  contenido: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type MessageType =
  | 'text'
  | 'widget'
  | 'decision'
  | 'approval'       // human-in-the-loop genérico
  | 'rfq-log'
  | 'rfq-status'
  | 'file-upload'
  | 'parse_confirm'
  | 'docs_parsed'
  | 'bulk-widget'
  | 'imagen_lista'
  | 'imagen_fallida';

// ── Agentes ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  org_id: string;
  stream_id?: string;
  name: string;
  description?: string;
  agent_type: 'prompt' | 'worker' | 'bot';
  model_id?: string;
  system_prompt?: string;
  temperature: number;
  max_tokens: number;
  tools: string[];
  autonomy_level: 'manual' | 'supervised' | 'autonomous';
  is_active: boolean;
  status?: 'ok' | 'running' | 'waiting' | 'error';
  config: Record<string, unknown>;
}

// ── Conectores ────────────────────────────────────────────────────────────────

export interface Connector {
  id: string;
  org_id: string;
  connector_type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  last_tested_at?: string;
  updated_at: string;
}

export interface ConnectorDef {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'crm' | 'infra' | 'ai' | 'channel' | 'ecommerce';
  fields: ConnectorField[];
}

export interface ConnectorField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  org_id: string;
  stream_id?: string;
  agent_id?: string;
  agent_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  input_data: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  logs: JobLog[];
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface JobLog {
  step: string;
  message: string;
  timestamp: string;
}

// ── RAG / Fuentes ─────────────────────────────────────────────────────────────

export interface RagSource {
  id: string;
  org_id: string;
  stream_id?: string;
  name: string;
  source_type: 'rule' | 'policy' | 'document' | 'url' | 'text' | 'faq';
  content: string;
  scope: 'global' | 'stream';
  always_include: boolean;
  created_at: string;
}

// ── Skills ────────────────────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  skill_type: 'prompt' | 'worker' | 'bundle';
  is_official: boolean;
  price_usd: number;
  connectors_required: string[];
  downloads: number;
  rating: number;
}

// ── Infraestructura ───────────────────────────────────────────────────────────

export interface InfraService {
  id: string;
  name: string;
  type: 'railway' | 'supabase' | 'hostinger' | 'ai_model' | 'channel';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
}

// ── Notificaciones ────────────────────────────────────────────────────────────

export interface StreamNotification {
  id: string;
  org_id: string;
  stream_id?: string;
  job_id?: string;
  type: 'approval_required' | 'alert' | 'info';
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'dismissed';
  created_at: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  org_id: string;
  action: string;
  actor_type: 'agent' | 'user' | 'system' | 'external';
  actor_id: string;
  stream_id?: string;
  status: 'ok' | 'error' | 'pending';
  created_at: string;
}

// ── Portal externo ────────────────────────────────────────────────────────────

export interface PortalTask {
  id: string;
  org_id: string;
  stream_id?: string;
  external_user_id: string;
  title: string;
  description?: string;
  task_type: 'upload' | 'photo' | 'video' | 'gps' | 'approval' | 'form';
  status: 'pending' | 'completed' | 'skipped';
  due_at?: string;
}
