const BASE_URL = 'http://localhost:5000/api';
let token = null;
export const setToken = (t) => { token = t; };

async function r(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (b) => r('/user/register', 'POST', b),
  login: (b) => r('/user/login', 'POST', b),
  updateProfile: (b) => r('/user/profile', 'PUT', b),
  changePassword: (b) => r('/user/password', 'PUT', b),

  getContent: () => r('/content'),
  addContent: (b) => r('/content', 'POST', b),
  updateContent: (id, b) => r(`/content/${id}`, 'PUT', b),
  deleteContent: (id) => r(`/content/${id}`, 'DELETE'),

  getTasks: () => r('/task'),
  addTask: (b) => r('/task', 'POST', b),
  updateTask: (id, b) => r(`/task/${id}`, 'PUT', b),
  deleteTask: (id) => r(`/task/${id}`, 'DELETE'),
  getBlocks: () => r('/task/timeblock'),
  addBlock: (b) => r('/task/timeblock', 'POST', b),
  deleteBlock: (id) => r(`/task/timeblock/${id}`, 'DELETE'),

  getTransactions: () => r('/finance/user-ledger'),
  addTransaction: (b) => r('/finance/transaction', 'POST', b),
  deleteTransaction: (id) => r(`/finance/transaction/${id}`, 'DELETE'),
  getDeals: () => r('/finance/sponsorship'),
  addDeal: (b) => r('/finance/sponsorship', 'POST', b),
  updateDeal: (id, b) => r(`/finance/sponsorship/${id}`, 'PUT', b),
  deleteDeal: (id) => r(`/finance/sponsorship/${id}`, 'DELETE'),

  financeAnalytics: (period = '6m') => r(`/dashboard/finance-analytics?period=${encodeURIComponent(period)}`),
  productivityAnalytics: (period = '7d') => r(`/dashboard/productivity-analytics?period=${encodeURIComponent(period)}`),
  contentAnalytics: () => r('/dashboard/content-analytics')
};
