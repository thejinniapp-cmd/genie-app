/**
 * Cliente para la API de genie-core (Python/FastAPI)
 * Todas las llamadas al backend pasan por aquí.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(
  path: string,
  options: RequestInit & { orgId?: string } = {}
): Promise<T> {
  const { orgId, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Pasar org_id en header para multi-tenant
  if (orgId) headers['X-Org-Id'] = orgId;

  // Auth token de Supabase
  const token = localStorage.getItem('genie_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }

  return res.json();
}

// ── Streams ───────────────────────────────────────────────────────────────────

export const streamsApi = {
  list: (orgId: string) =>
    request('/api/streams/', { orgId }),

  get: (orgId: string, streamId: string) =>
    request(`/api/streams/${streamId}`, { orgId }),

  create: (orgId: string, data: { name: string; type: string; description?: string }) =>
    request('/api/streams/', { method: 'POST', orgId, body: JSON.stringify(data) }),

  update: (orgId: string, streamId: string, data: Record<string, unknown>) =>
    request(`/api/streams/${streamId}`, { method: 'PATCH', orgId, body: JSON.stringify(data) }),

  getMessages: (orgId: string, streamId: string, limit = 50) =>
    request(`/api/streams/${streamId}/messages?limit=${limit}`, { orgId }),

  postMessage: (orgId: string, streamId: string, message: Record<string, unknown>) =>
    request(`/api/streams/${streamId}/messages`, {
      method: 'POST', orgId, body: JSON.stringify(message),
    }),
};

// ── Agentes ───────────────────────────────────────────────────────────────────

export const agentsApi = {
  list: (orgId: string, streamId?: string) =>
    request(`/api/agents/${streamId ? `?stream_id=${streamId}` : ''}`, { orgId }),

  create: (orgId: string, data: Record<string, unknown>) =>
    request('/api/agents/', { method: 'POST', orgId, body: JSON.stringify(data) }),

  update: (orgId: string, agentId: string, data: Record<string, unknown>) =>
    request(`/api/agents/${agentId}`, { method: 'PATCH', orgId, body: JSON.stringify(data) }),

  test: (orgId: string, agentId: string) =>
    request(`/api/agents/${agentId}/test`, { method: 'POST', orgId }),
};

// ── Conectores ────────────────────────────────────────────────────────────────

export const connectorsApi = {
  list: (orgId: string) =>
    request('/api/connectors/', { orgId }),

  connect: (orgId: string, type: string, credentials: Record<string, string>) =>
    request('/api/connectors/', {
      method: 'POST', orgId,
      body: JSON.stringify({ connector_type: type, credentials }),
    }),

  test: (orgId: string, type: string) =>
    request(`/api/connectors/${type}/test`, { method: 'POST', orgId }),

  disconnect: (orgId: string, type: string) =>
    request(`/api/connectors/${type}`, { method: 'DELETE', orgId }),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (orgId: string, streamId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (streamId) params.set('stream_id', streamId);
    if (status) params.set('status', status);
    return request(`/api/jobs/?${params}`, { orgId });
  },

  approve: (orgId: string, jobId: string) =>
    request(`/api/jobs/${jobId}/approve`, { method: 'POST', orgId }),

  reject: (orgId: string, jobId: string, reason?: string) =>
    request(`/api/jobs/${jobId}/reject`, {
      method: 'POST', orgId, body: JSON.stringify({ reason }),
    }),
};

// ── RAG ───────────────────────────────────────────────────────────────────────

export const ragApi = {
  list: (orgId: string, streamId?: string) =>
    request(`/api/rag/${streamId ? `?stream_id=${streamId}` : ''}`, { orgId }),

  add: (orgId: string, data: {
    name: string;
    content: string;
    source_type: string;
    stream_id?: string;
    always_include?: boolean;
    scope?: 'global' | 'stream';
  }) =>
    request('/api/rag/', { method: 'POST', orgId, body: JSON.stringify(data) }),

  propagate: (orgId: string, sourceId: string, targetStreamIds: string[]) =>
    request(`/api/rag/${sourceId}/propagate`, {
      method: 'POST', orgId, body: JSON.stringify({ target_stream_ids: targetStreamIds }),
    }),

  delete: (orgId: string, sourceId: string) =>
    request(`/api/rag/${sourceId}`, { method: 'DELETE', orgId }),
};

// ── Skills ────────────────────────────────────────────────────────────────────

export const skillsApi = {
  list: (category?: string) =>
    request(`/api/skills/${category ? `?category=${category}` : ''}`),

  install: (orgId: string, skillId: string, streamId: string, config: Record<string, unknown>) =>
    request('/api/skills/install', {
      method: 'POST', orgId,
      body: JSON.stringify({ skill_id: skillId, stream_id: streamId, config }),
    }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getMetrics: (orgId: string) =>
    request('/api/dashboard/metrics', { orgId }),

  getAuditLog: (orgId: string, streamId?: string, limit = 100) =>
    request(`/api/dashboard/audit?limit=${limit}${streamId ? `&stream_id=${streamId}` : ''}`, { orgId }),
};
