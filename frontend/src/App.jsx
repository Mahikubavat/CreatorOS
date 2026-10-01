import { useState, useEffect, useCallback, useRef } from 'react';
import { api, setToken, USE_BACKEND } from './api';
import AuthForm from './AuthForm';
import { Dashboard, ContentTab, TasksTab, FinanceTab, AnalyticsTab, ProfileTab } from './Views';

// separate saved logins for browser-only mode and backend mode so they never mix
const SESSION_KEY = USE_BACKEND ? 'creatoros_session' : 'creatoros_session_local';
const TABS = ['Dashboard', 'Content', 'Tasks', 'Finance', 'Analytics'];
const SUBTITLES = {
  Content: 'Plan, script and schedule your videos',
  Tasks: 'Your to-dos and time blocks',
  Finance: 'Income, expenses and sponsorships',
  Analytics: 'Your numbers at a glance'
};
const ICONS = {
  Dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  Content: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" /></>,
  Tasks: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 12.5l3 3 5-6" /></>,
  Finance: <><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="16.5" cy="14.5" r="1.2" /></>,
  Analytics: <path d="M5 20V11M12 20V4M19 20v-6" />
};
const Icon = ({ name }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;

function Avatar({ user, cls = 'avatar-sm' }) {
  const name = user.displayName || user.fullName || '';
  return user.profilePicture
    ? <img className={cls} src={user.profilePicture} alt={name} />
    : <span className={`${cls} avatar-initial`}>{name.charAt(0).toUpperCase() || '?'}</span>;
}

function ProfileMenu({ user, active, onEdit, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  const name = user.displayName || user.fullName || '';
  return (
    <div className="profile-menu" ref={ref}>
      <button className={active ? 'avatar-btn on' : 'avatar-btn'} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} title={name}>
        <Avatar user={user} />
        <span className="caret">▾</span>
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <div className="menu-head"><strong>{name}</strong><span className="dim">{user.email}</span></div>
          <button role="menuitem" onClick={() => { setOpen(false); onEdit(); }}>Edit profile</button>
          <button role="menuitem" className="danger" onClick={() => { setOpen(false); onLogout(); }}>Log out</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (s) setToken(s.token);
    return s;
  });
  const [tab, setTab] = useState('Dashboard');
  const [data, setData] = useState({ content: [], tasks: [], blocks: [], tx: [], deals: [] });
  const [err, setErr] = useState('');

  const save = (s) => { setSession(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); };
  const onAuthed = (token, user) => { setToken(token); save({ token, user }); setTab('Dashboard'); };
  const logout = () => { setToken(null); setSession(null); localStorage.removeItem(SESSION_KEY); setData({ content: [], tasks: [], blocks: [], tx: [], deals: [] }); };

  const reload = useCallback(async () => {
    try {
      const [c, t, b, x, d] = await Promise.all([api.getContent(), api.getTasks(), api.getBlocks(), api.getTransactions(), api.getDeals()]);
      setData({ content: c.data, tasks: t.data, blocks: b.data, tx: x.data, deals: d.data });
      setErr('');
    } catch (e) {
      if (/token/i.test(e.message)) logout(); else setErr(e.message);
    }
  }, []);

  useEffect(() => { if (session) reload(); }, [session?.token]);

  const user = session?.user;
  const cur = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' }[user?.preferredBaseCurrency || 'USD'] || '$';
  const p = { data, reload, cur, user };

  if (!session) return <AuthForm onAuthed={onAuthed} />;

  const first = (user.displayName || user.fullName || 'creator').split(' ')[0];
  const title = tab === 'Dashboard' ? `Hello ${first}` : tab === 'Profile' ? 'Your profile' : tab;
  const subtitle = tab === 'Dashboard'
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : SUBTITLES[tab];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="side-brand">CREATOR<span>OS.</span></div>
        <nav className="side-nav">
          {TABS.map(t => (
            <button key={t} className={t === tab ? 'nav-item on' : 'nav-item'} onClick={() => setTab(t)}><Icon name={t} /><span>{t}</span></button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="side-promo">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="rgba(0,0,0,0.35)" /></svg>
            <p>See how your channel<br />is really doing</p>
            <button onClick={() => setTab('Analytics')}>OPEN ANALYTICS ›</button>
          </div>
          <button className="side-user" onClick={() => setTab('Profile')}>
            <Avatar user={user} cls="avatar-xs" />
            <span><b>{user.displayName || user.fullName}</b><small>{(user.contentNiche || 'Creator').toUpperCase()}</small></span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="main-head">
          <div>
            <h1>{title}</h1>
            {tab === 'Profile'
              ? <button className="link-btn crumb" onClick={() => setTab('Dashboard')}>‹ Back to dashboard</button>
              : <div className="crumb">{subtitle}</div>}
          </div>
          <ProfileMenu user={user} active={tab === 'Profile'} onEdit={() => setTab('Profile')} onLogout={logout} />
        </header>

        {err && <div className="error-box">{err}</div>}
        {tab === 'Dashboard' && <Dashboard {...p} go={setTab} />}
        {tab === 'Content' && <ContentTab {...p} />}
        {tab === 'Tasks' && <TasksTab {...p} />}
        {tab === 'Finance' && <FinanceTab {...p} />}
        {tab === 'Analytics' && <AnalyticsTab {...p} />}
        {tab === 'Profile' && <ProfileTab {...p} onUser={(u) => save({ ...session, user: u })} />}
      </main>
    </div>
  );
}
