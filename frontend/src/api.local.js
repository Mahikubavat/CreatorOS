// Frontend-only API: same interface as api.server.js, but data lives in the browser (localStorage).
// To use the Express/MongoDB backend instead, rename api.server.js to api.js.
const KEY = 'creatoros_db';
const EMPTY = { users: [], content: [], tasks: [], blocks: [], tx: [], deals: [] };
let uid = null;
export const setToken = (t) => { uid = t; };

const load = () => ({ ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') });
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const ok = (data, extra = {}) => Promise.resolve({ success: true, data, ...extra });
const fail = (m) => Promise.reject(new Error(m));
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();
const hash = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const safe = ({ password, ...u }) => u;
const mine = (db, k) => db[k].filter(x => x.userId === uid);
const day = (d) => (d ? String(d).slice(0, 10) : '');

const add = (k, body, required) => {
  for (const f of required) if (body[f] === undefined || body[f] === '') return fail(`${f} is required`);
  const db = load(); const item = { ...body, _id: id(), userId: uid, createdAt: now(), updatedAt: now() };
  db[k].push(item); save(db); return ok(item);
};
const update = (k, itemId, body) => {
  const db = load(); const i = db[k].findIndex(x => x._id === itemId && x.userId === uid);
  if (i < 0) return fail('Not found');
  db[k][i] = { ...db[k][i], ...body, updatedAt: now() }; save(db); return ok(db[k][i]);
};
const remove = (k, itemId) => { const db = load(); db[k] = db[k].filter(x => !(x._id === itemId && x.userId === uid)); save(db); return ok({}); };
const list = (k) => ok(mine(load(), k));

export const api = {
  register: async ({ fullName, email, password, contentNiche }) => {
    if (!fullName || !email || !password || !contentNiche) return fail('All fields are required');
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Invalid email format');
    const db = load();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return fail('Email already registered');
    const user = { _id: id(), fullName, email, contentNiche, password: await hash(password), preferredBaseCurrency: 'USD', createdAt: now() };
    db.users.push(user); save(db);
    return { success: true, token: user._id, data: safe(user) };
  },
  login: async ({ email, password }) => {
    const u = load().users.find(x => x.email.toLowerCase() === (email || '').toLowerCase());
    if (!u || u.password !== (await hash(password || ''))) return fail('Invalid email or password');
    return { success: true, token: u._id, data: safe(u) };
  },
  updateProfile: (b) => {
    const db = load(); const i = db.users.findIndex(u => u._id === uid);
    if (i < 0) return fail('Not authorized, token invalid');
    const { password, _id, email, ...rest } = b;
    db.users[i] = { ...db.users[i], ...rest }; save(db); return ok(safe(db.users[i]));
  },
  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!newPassword || newPassword.length < 6) return fail('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return fail('Passwords do not match');
    const db = load(); const u = db.users.find(x => x._id === uid);
    if (!u || u.password !== (await hash(currentPassword || ''))) return fail('Current password is incorrect');
    u.password = await hash(newPassword); save(db); return ok({});
  },

  getContent: () => list('content'),
  addContent: (b) => add('content', { stage: 'Idea', ...b }, ['title', 'platform']),
  updateContent: (i, b) => update('content', i, b),
  deleteContent: (i) => remove('content', i),

  getTasks: () => {
    const db = load();
    return ok(mine(db, 'tasks').map(t => ({ ...t, contentId: db.content.find(c => c._id === t.contentId) || null })));
  },
  addTask: (b) => add('tasks', { priority: 'Medium', status: 'Active', ...b }, ['title']),
  updateTask: (i, b) => update('tasks', i, {
    ...b,
    ...(b.status === 'Completed' ? { completedAt: now() } : {}),
    ...(b.status === 'Active' ? { completedAt: null } : {})
  }),
  deleteTask: (i) => remove('tasks', i),
  getBlocks: () => list('blocks'),
  addBlock: (b) => {
    if (!b.label || !b.startTime || !b.endTime || b.startTime >= b.endTime) return fail('End time must be after start time');
    const clash = mine(load(), 'blocks').find(x => day(x.date) === day(b.date) && x.startTime < b.endTime && x.endTime > b.startTime);
    if (clash) return fail(`Overlaps with "${clash.label}" (${clash.startTime}-${clash.endTime})`);
    return add('blocks', b, ['date']);
  },
  deleteBlock: (i) => remove('blocks', i),

  getTransactions: () => ok(mine(load(), 'tx').sort((a, b) => day(b.date).localeCompare(day(a.date)))),
  addTransaction: (b) => (b.amount >= 0 ? add('tx', b, ['type', 'amount', 'category']) : fail('Amount must be positive')),
  deleteTransaction: (i) => remove('tx', i),
  getDeals: () => list('deals'),
  addDeal: (b) => add('deals', { contractStatus: 'Lead', invoiceStatus: 'Pending', deliverables: [], ...b }, ['brandName', 'dealValue']),
  updateDeal: (i, b) => update('deals', i, b),
  deleteDeal: (i) => remove('deals', i),

  financeAnalytics: (period = '6m') => {
    const tx = mine(load(), 'tx'); const start = new Date(); start.setHours(0, 0, 0, 0);
    if (period === '7d') start.setDate(start.getDate() - 6);
    else if (period === '30d') start.setDate(start.getDate() - 29);
    else if (period === '90d') start.setDate(start.getDate() - 89);
    else if (period === '12m') { start.setDate(1); start.setMonth(start.getMonth() - 11); }
    else if (period === '6m') { start.setDate(1); start.setMonth(start.getMonth() - 5); }
    const selected = period === 'all' ? tx : tx.filter(t => new Date(t.date) >= start);
    const cat = {}; const buckets = {};
    selected.forEach(t => {
      const ck = `${t.type}|${t.category}`; cat[ck] = (cat[ck] || 0) + t.amount;
      const date = day(t.date); const bucket = ['7d', '30d', '90d'].includes(period) ? date : date.slice(0, 7);
      const key = `${bucket}|${t.type}`; buckets[key] = (buckets[key] || 0) + t.amount;
    });
    const byCategory = Object.entries(cat).map(([key, total]) => { const [type, category] = key.split('|'); return { _id: { type, category }, total }; }).sort((a, b) => b.total - a.total);
    const totalIncome = byCategory.filter(item => item._id.type === 'Income').reduce((sum, item) => sum + item.total, 0);
    const totalExpense = byCategory.filter(item => item._id.type === 'Expense').reduce((sum, item) => sum + item.total, 0);
    return ok({
      period,
      summary: { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, profitMargin: totalIncome ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0 },
      byCategory,
      monthly: Object.entries(buckets).map(([key, total]) => { const [date, type] = key.split('|'); return { _id: { date, type }, total }; })
    });
  },
  productivityAnalytics: (period = '7d') => {
    const tasks = mine(load(), 'tasks'); const t0 = now().slice(0, 10);
    const done = tasks.filter(t => t.status === 'Completed');
    const count = period === '30d' ? 30 : 7;
    const elapsedDeadlines = tasks.filter(t => t.dueDate && day(t.dueDate) < t0);
    const missed = elapsedDeadlines.filter(t => t.status === 'Active' || (t.completedAt && day(t.completedAt) > day(t.dueDate)));
    const trend = [...Array(count)].map((_, i) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (count - 1 - i)); const date = d.toISOString().slice(0, 10);
      return { date, completed: done.filter(t => day(t.completedAt || t.updatedAt) === date).length };
    });
    const weekdayPattern = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      day: dayOfWeek,
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      tasks: tasks.filter(t => t.dueDate && new Date(t.dueDate).getDay() === dayOfWeek).length
    }));
    const blocks = mine(load(), 'blocks');
    const routinePattern = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      day: dayOfWeek,
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      blocks: blocks.filter(block => new Date(`${day(block.date)}T00:00:00.000Z`).getUTCDay() === dayOfWeek).length
    }));
    return ok({
      total: tasks.length,
      completed: done.length,
      active: tasks.length - done.length,
      period,
      overdue: tasks.filter(t => t.status === 'Active' && t.dueDate && day(t.dueDate) < t0).length,
      completionRate: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
      missedRate: elapsedDeadlines.length ? Math.round((missed.length / elapsedDeadlines.length) * 100) : 0,
      missedDeadlines: missed.length,
      elapsedDeadlines: elapsedDeadlines.length,
      trend,
      week: trend,
      weekdayPattern,
      routinePattern
    });
  },
  contentAnalytics: () => {
    const c = mine(load(), 'content'); const st = {}; const pl = {};
    c.forEach(x => {
      st[x.stage] = (st[x.stage] || 0) + 1;
      pl[x.platform] = pl[x.platform] || { _id: x.platform, count: 0, published: 0, planned: 0 };
      pl[x.platform].count++;
      if (x.stage === 'Published') pl[x.platform].published++; else pl[x.platform].planned++;
    });
    const platformBreakdown = Object.values(pl);
    return ok({
      stageBreakdown: Object.entries(st).map(([k, count]) => ({ _id: k, count })),
      platformBreakdown,
      total: platformBreakdown.reduce((sum, item) => sum + item.count, 0),
      published: platformBreakdown.reduce((sum, item) => sum + item.published, 0),
      planned: platformBreakdown.reduce((sum, item) => sum + item.planned, 0)
    });
  }
};
