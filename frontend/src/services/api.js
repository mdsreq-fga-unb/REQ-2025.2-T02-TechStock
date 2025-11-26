const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = { ...options };
  config.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  let payload = null;
  if (response.status !== 204) {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || 'Erro ao comunicar com o servidor');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const clientesApi = {
  list: (filters = {}) => apiFetch(`/clientes${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/clientes/${id}`),
  create: (payload) => apiFetch('/clientes', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/clientes/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiFetch(`/clientes/${id}`, { method: 'DELETE' }),
};

export const pecasApi = {
  list: (filters = {}) => apiFetch(`/pecas${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/pecas/${id}`),
  create: (payload) => apiFetch('/pecas', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/pecas/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiFetch(`/pecas/${id}`, { method: 'DELETE' }),
};

export const celularesApi = {
  list: (filters = {}) => apiFetch(`/celulares${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/celulares/${id}`),
  create: (payload) => apiFetch('/celulares', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/celulares/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiFetch(`/celulares/${id}`, { method: 'DELETE' }),
};

export const ordensServicoApi = {
  list: (filters = {}) => apiFetch(`/ordens-servico${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/ordens-servico/${id}`),
  create: (payload) => apiFetch('/ordens-servico', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/ordens-servico/${id}`, { method: 'PATCH', body: payload }),
  remove: (id) => apiFetch(`/ordens-servico/${id}`, { method: 'DELETE' }),
  registrarPecas: (id, itens) => apiFetch(`/ordens-servico/${id}/pecas`, { method: 'POST', body: { itens } }),
};

export const dashboardsApi = {
  getResumo: () => apiFetch('/dashboard/resumo'),
};

export default apiFetch;
