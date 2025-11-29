const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const defaultTokenProvider = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('authToken');
  } catch (_) {
    return null;
  }
};

let tokenProvider = defaultTokenProvider;
let unauthorizedHandler = null;

export function setApiAuthHandlers({ tokenProvider: provider, onUnauthorized } = {}) {
  tokenProvider = provider || defaultTokenProvider;
  unauthorizedHandler = onUnauthorized || null;
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = { ...options };
  config.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = tokenProvider ? tokenProvider() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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
    if (response.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler(error);
    }
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

export const clientesHistoricoApi = {
  list: (filters = {}) => apiFetch(`/clientes/historico${buildQuery(filters)}`),
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

export const ordensServicoTestesApi = {
  listByOrdem: (id, filters = {}) => apiFetch(`/ordens-servico/${id}/testes${buildQuery(filters)}`),
  create: (id, payload) => apiFetch(`/ordens-servico/${id}/testes`, { method: 'POST', body: payload }),
};

export const movimentacoesEstoqueApi = {
  list: (filters = {}) => apiFetch(`/movimentacoes-estoque${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/movimentacoes-estoque/${id}`),
  create: (payload) => apiFetch('/movimentacoes-estoque', { method: 'POST', body: payload }),
};

export const vendasApi = {
  list: (filters = {}) => apiFetch(`/vendas${buildQuery(filters)}`),
  getById: (id) => apiFetch(`/vendas/${id}`),
  create: (payload) => apiFetch('/vendas', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/vendas/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiFetch(`/vendas/${id}`, { method: 'DELETE' }),
};

export const dashboardsApi = {
  getResumo: () => apiFetch('/dashboard/resumo'),
};

export const authApi = {
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: payload }),
};

export default apiFetch;
