import { useState, useEffect } from 'react';
import { api } from './api';

const STAGES = ['Idea', 'Scripting', 'Editing', 'Scheduled', 'Published'];
const PLATFORMS = ['YouTube', 'TikTok', 'Blog', 'Instagram', 'Other'];
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const day = (d) => (d ? String(d).slice(0, 10) : '');
const money = (c, n) => `${n < 0 ? '-' : ''}${c}${Math.abs(n).toLocaleString()}`;

// run an API call, then refresh; show errors inline
function useAct(reload) {
  const [err, setErr] = useState('');
  const act = async (fn) => { try { setErr(''); await fn(); await reload(); return true; } catch (e) { setErr(e.message); return false; } };
  return [err, act];
}
const Err = ({ e }) => (e ? <div className="error-box" style={{ marginBottom: 12 }}>{e}</div> : null);
const Panel = ({ title, count, children }) => (
  <div className="panel" style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ margin: '0 0 14px' }}>{title}</h3>{count !== undefined && <span className="dim">{count}</span>}</div>
    {children}
  </div>
);
const Stat = ({ v, l, cls }) => <div className="stat-block"><div className={`num ${cls || ''}`} style={{ fontSize: 26, fontWeight: 600 }}>{v}</div><div className="dim">{l}</div></div>;
const Bars = ({ rows, fmt = (x) => x }) => {
  const max = Math.max(1, ...rows.map(r => r.v));
  return rows.length ? rows.map(r => (
    <div className="brow" key={r.k}><span>{r.k}</span><div><div className="bar" style={{ width: `${(r.v / max) * 100}%` }} /></div><span className="dim">{fmt(r.v)}</span></div>
  )) : <div className="empty">No data yet.</div>;
};

const GroupedChart = ({ rows, series, format = (value) => value }) => {
  const width = 720, height = 260, left = 54, right = 12, top = 12, bottom = 42;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const maxValue = Math.max(1, ...rows.flatMap(row => series.map(item => Math.max(0, row[item.key] || 0))));
  const groupWidth = rows.length ? plotWidth / rows.length : plotWidth;
  const gap = 4;
  const barWidth = Math.max(3, Math.min(28, (groupWidth * 0.76 - gap * (series.length - 1)) / series.length));
  const labelStep = Math.max(1, Math.ceil(rows.length / 12));
  return (
    <div className="chart-scroll">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Interactive comparison chart">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = top + plotHeight * (1 - fraction);
          return <g key={fraction}><line x1={left} x2={width - right} y1={y} y2={y} className="chart-gridline" />
            <text x={left - 8} y={y + 4} textAnchor="end" className="chart-tick">{format(maxValue * fraction)}</text></g>;
        })}
        {rows.map((row, rowIndex) => {
          const totalWidth = series.length * barWidth + (series.length - 1) * gap;
          const startX = left + rowIndex * groupWidth + (groupWidth - totalWidth) / 2;
          return <g key={row.key || row.label}>
            {series.map((item, seriesIndex) => {
              const value = Math.max(0, row[item.key] || 0);
              const barHeight = value / maxValue * plotHeight;
              const x = startX + seriesIndex * (barWidth + gap);
              const y = top + plotHeight - barHeight;
              return <rect key={item.key} x={x} y={y} width={barWidth} height={barHeight} rx="2" fill={item.color} tabIndex="0">
                <title>{`${row.label}, ${item.label}: ${format(value)}`}</title>
              </rect>;
            })}
            {rowIndex % labelStep === 0 && <text x={left + rowIndex * groupWidth + groupWidth / 2} y={height - 13} textAnchor="middle" className="chart-label">{row.label}</text>}
          </g>;
        })}
      </svg>
    </div>
  );
};

const ChartLegend = ({ series }) => <div className="chart-legend">{series.map(item => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}</div>;


/* ---------- Dashboard-style chart helpers ---------- */
const PALETTE = ['#111111', '#8FD3C9', '#C9D96A', '#E3AFCB', '#F0C987', '#B7B2A3', '#6FA8DC', '#D98E73'];

const Sparkline = ({ values }) => {
  if (!values || values.length < 2) return null;
  const w = 120, h = 36, max = Math.max(1, ...values), min = Math.min(0, ...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(' ');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

const Donut = ({ rows, format, centerLabel }) => {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const r = 62, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" className="donut" role="img" aria-label="Breakdown chart">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--panel-hover)" strokeWidth="24" />
        {rows.map((row, i) => {
          const len = total ? (row.amount / total) * C : 0;
          const el = <circle key={row.key} cx="90" cy="90" r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="24"
            strokeDasharray={`${Math.max(0, len - 2)} ${C - Math.max(0, len - 2)}`} strokeDashoffset={-acc} transform="rotate(-90 90 90)"><title>{`${row.label}: ${format(row.amount)}`}</title></circle>;
          acc += len;
          return el;
        })}
        <text x="90" y="86" textAnchor="middle" className="donut-total">{format(total)}</text>
        <text x="90" y="104" textAnchor="middle" className="donut-sub">{centerLabel}</text>
      </svg>
      <ul className="donut-legend">
        {rows.map((row, i) => <li key={row.key}><i style={{ background: PALETTE[i % PALETTE.length] }} /><span className="nm">{row.label}</span><span className="dim">{total ? Math.round(row.amount / total * 100) : 0}%</span><b>{format(row.amount)}</b></li>)}
      </ul>
    </div>
  );
};

const Ring = ({ pct, color, label, sub }) => {
  const r = 34, C = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct || 0));
  return (
    <div className="ring">
      <svg viewBox="0 0 88 88"><circle cx="44" cy="44" r={r} fill="none" stroke="var(--panel-hover)" strokeWidth="10" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(v / 100) * C} ${C}`} transform="rotate(-90 44 44)" />
        <text x="44" y="49" textAnchor="middle" className="ring-num">{v}%</text></svg>
      <div><b>{label}</b><div className="dim">{sub}</div></div>
    </div>
  );
};

const AreaChart = ({ rows, series, format = (v) => v }) => {
  const width = 720, height = 260, left = 54, right = 14, top = 14, bottom = 36;
  const pw = width - left - right, ph = height - top - bottom;
  const max = Math.max(1, ...rows.flatMap(r => series.map(s => r[s.key] || 0)));
  const x = (i) => left + (rows.length === 1 ? pw / 2 : (i * pw) / (rows.length - 1));
  const y = (v) => top + ph * (1 - v / max);
  const line = (key) => rows.map((r, i) => {
    if (i === 0) return `M${x(0)},${y(r[key] || 0)}`;
    const x0 = x(i - 1), y0 = y(rows[i - 1][key] || 0), x1 = x(i), y1 = y(r[key] || 0), mx = (x0 + x1) / 2;
    return `C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }).join(' ');
  const step = Math.max(1, Math.ceil(rows.length / 10));
  return (
    <div className="chart-scroll">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Income and expenses trend">
        <defs>{series.map(s => <linearGradient key={s.key} id={`ag-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity="0.35" /><stop offset="100%" stopColor={s.color} stopOpacity="0.02" /></linearGradient>)}</defs>
        {[0, 0.25, 0.5, 0.75, 1].map(f => <g key={f}><line x1={left} x2={width - right} y1={top + ph * (1 - f)} y2={top + ph * (1 - f)} className="chart-gridline" /><text x={left - 8} y={top + ph * (1 - f) + 4} textAnchor="end" className="chart-tick">{format(max * f)}</text></g>)}
        {series.map(s => <g key={s.key}>
          <path d={`${line(s.key)} L${x(rows.length - 1)},${top + ph} L${x(0)},${top + ph} Z`} fill={`url(#ag-${s.key})`} />
          <path d={line(s.key)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" />
          {rows.length <= 31 && rows.map((r, i) => <circle key={i} cx={x(i)} cy={y(r[s.key] || 0)} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2"><title>{`${r.label}, ${s.label}: ${format(r[s.key] || 0)}`}</title></circle>)}
        </g>)}
        {rows.map((r, i) => i % step === 0 && <text key={i} x={x(i)} y={height - 12} textAnchor="middle" className="chart-label">{r.label}</text>)}
      </svg>
    </div>
  );
};

const KCard = ({ cls, label, value, sub, spark }) => (
  <div className={`kcard ${cls}`}><div className="kl">{label}</div><div className="kv">{value}</div>{sub && <div className="ks">{sub}</div>}{spark}</div>
);
const DPanel = ({ title, sub, span, children }) => (
  <div className={`panel dpanel${span === 2 ? ' span2' : ''}${span === 4 ? ' span4' : ''}`}><h3>{title}{sub && <span className="dim">{sub}</span>}</h3>{children}</div>
);

/* ---------- Dashboard ---------- */
const hm = (s) => { const [h, m] = String(s).split(':').map(Number); return h + (m || 0) / 60; };
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pctChange = (c, p) => (p ? Math.round(((c - p) / Math.abs(p)) * 100) : null);
const chgText = (v) => (v === null ? 'NEW THIS MONTH' : `${v >= 0 ? '+' : ''}${v}% LAST MONTH`);
const TILE_COLORS = ['#DDEBD0', '#F4E3B8', '#E8D3E0', '#CFE6E1', '#E6E1D3'];

function PipelineRings({ groups }) {
  const total = groups.reduce((s, g) => s + g.count, 0);
  const radii = [82, 64, 46];
  return (
    <>
      <svg viewBox="0 0 200 200" className="pipe-svg" role="img" aria-label="Content pipeline">
        {groups.map((g, i) => {
          const r = radii[i], C = 2 * Math.PI * r, share = total ? g.count / total : 0;
          return <g key={g.label}>
            <circle cx="100" cy="100" r={r} fill="none" stroke="#F0EFEA" strokeWidth="13" />
            <circle cx="100" cy="100" r={r} fill="none" stroke={g.color} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${share * C} ${C}`} transform="rotate(-90 100 100)"><title>{`${g.label}: ${g.count}`}</title></circle>
          </g>;
        })}
        <text x="100" y="102" textAnchor="middle" className="pipe-num">{total}</text>
        <text x="100" y="120" textAnchor="middle" className="pipe-sub">PIECES</text>
      </svg>
      <div className="pipe-legend">
        {groups.map(g => <div key={g.label}><i style={{ background: g.color }} /><b>{total ? Math.round(g.count / total * 100) : 0}%</b><span>{g.label}</span></div>)}
      </div>
    </>
  );
}

function WeekPlanner({ blocks }) {
  const [off, setOff] = useState(0);
  const ROW = 38;
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const start = new Date(base); start.setDate(base.getDate() - ((base.getDay() + 6) % 7) + off * 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const keys = days.map(isoDay), todayKey = isoDay(new Date());
  const wk = blocks.filter(b => keys.includes(day(b.date)));
  let first = 8, last = 17;
  wk.forEach(b => { first = Math.min(first, Math.floor(hm(b.startTime))); last = Math.max(last, Math.ceil(hm(b.endTime)) - 1); });
  last = Math.min(23, Math.max(last, first));
  const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const placed = keys.flatMap((k, di) => {
    const list = wk.filter(b => day(b.date) === k).sort((a, b) => hm(a.startTime) - hm(b.startTime));
    const ends = [], items = [];
    list.forEach(b => {
      const s = hm(b.startTime), e = Math.max(hm(b.endTime), s + 0.5);
      let lane = ends.findIndex(x => x <= s);
      if (lane < 0) { lane = ends.length; ends.push(0); }
      ends[lane] = e; items.push({ b, s, e, lane });
    });
    return items.map(it => ({ ...it, di, lanes: ends.length }));
  });
  const mid = days[3];
  return (
    <div className="d-card sand cal-card">
      <div className="cal-head">
        <button className="pill-btn" onClick={() => setOff(off - 1)}>‹ Prev week</button>
        <div className="cal-title"><h3>{mid.toLocaleString('default', { month: 'long' })} {mid.getFullYear()}</h3>{off !== 0 && <button className="link-btn" onClick={() => setOff(0)}>Back to this week</button>}</div>
        <button className="pill-btn" onClick={() => setOff(off + 1)}>Next week ›</button>
      </div>
      <div className="wk">
        <div />
        {days.map(d => <div key={d} className={`wk-h${isoDay(d) === todayKey ? ' today' : ''}`}>{d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}, {d.getDate()}</div>)}
        <div className="wk-times">{hours.map(h => <div key={h} style={{ height: ROW }}>{h}:00</div>)}</div>
        {days.map((d, di) => (
          <div key={di} className="wk-col" style={{ height: hours.length * ROW }}>
            {placed.filter(p => p.di === di).map(({ b, s, e, lane, lanes }) => (
              <div key={b._id} className="wk-pill" title={`${b.label} · ${b.startTime}–${b.endTime}`}
                style={{ top: (s - first) * ROW + 2, height: Math.max(24, (e - s) * ROW - 4), left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}>{b.label}</div>
            ))}
          </div>
        ))}
      </div>
      {!wk.length && <div className="empty">No time blocks this week. Add some in the Tasks tab.</div>}
    </div>
  );
}

export function Dashboard({ data, cur, go, user }) {
  const now = new Date(), t = today(), ym = t.slice(0, 7);
  const lm = isoDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)).slice(0, 7);
  const sum = (type, key) => data.tx.filter(x => x.type === type && day(x.date).startsWith(key)).reduce((s, x) => s + x.amount, 0);
  const inc = sum('Income', ym), exp = sum('Expense', ym), incL = sum('Income', lm), netL = incL - sum('Expense', lm);
  const net = inc - exp;
  const nowH = now.getHours() + now.getMinutes() / 60;

  const dueToday = data.tasks.filter(x => day(x.dueDate) === t);
  const doneToday = dueToday.filter(x => x.status === 'Completed').length;
  const planPct = dueToday.length ? Math.round((doneToday / dueToday.length) * 100) : 0;
  const blocksToday = data.blocks.filter(b => day(b.date) === t).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const plan = [
    ...blocksToday.map(b => ({ id: b._id, tile: b.startTime.slice(0, 5), title: b.label, sub: `${b.startTime}–${b.endTime}`, done: hm(b.endTime) <= nowH })),
    ...dueToday.map(x => ({ id: x._id, tile: 'TASK', title: x.title, sub: `${x.priority} priority`, done: x.status === 'Completed' }))
  ];

  const stage = (...s) => data.content.filter(c => s.includes(c.stage)).length;
  const groups = [
    { label: 'PUBLISHED', count: stage('Published'), color: '#8FD3C9' },
    { label: 'IN PRODUCTION', count: stage('Scripting', 'Editing', 'Scheduled'), color: '#C9D96A' },
    { label: 'IDEAS', count: stage('Idea'), color: '#E3AFCB' }
  ];
  const publishedThisMonth = data.content.filter(c => c.stage === 'Published' && day(c.publishDate).startsWith(ym)).length;
  const scheduled = stage('Scheduled');
  const upcoming = data.content.filter(c => c.publishDate && day(c.publishDate) >= t && c.stage !== 'Published')
    .sort((a, b) => day(a.publishDate).localeCompare(day(b.publishDate))).slice(0, 5);
  const unpaid = data.deals.filter(d => d.invoiceStatus !== 'Paid');
  const unpaidTotal = unpaid.reduce((s, d) => s + (d.dealValue || 0), 0);
  const spentPct = inc > 0 ? Math.min(100, Math.round((exp / inc) * 100)) : 0;
  const initial = (user.displayName || user.fullName || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className="d-grid">
        <div className="d-card hero-photo" style={user.profilePicture ? { backgroundImage: `url(${user.profilePicture})` } : undefined} onClick={() => go('Profile')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && go('Profile')}>
          {!user.profilePicture && <div className="hp-initial">{initial}<small>Add your photo in Profile</small></div>}
          <div className="hp-glass"><div className="hp-name">{user.fullName || user.displayName}</div><div className="hp-role">{(user.contentNiche || 'Creator').toUpperCase()}</div></div>
        </div>

        <div className="d-card white pipe-card">
          <h3>Content pipeline</h3>
          {data.content.length ? <PipelineRings groups={groups} /> : <div className="empty">No content yet. <button className="link-btn" onClick={() => go('Content')}>Add your first idea</button></div>}
        </div>

        <div className="d-card sand plan-card">
          <div className="plan-top"><h3>Today's plan</h3><div className="plan-pct">{planPct}%</div></div>
          <div className="plan-bar"><i style={{ left: `${planPct}%` }} /></div>
          <div className="plan-scale"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="plan-list">
            {!plan.length && <div className="empty">Nothing planned today. <button className="link-btn" onClick={() => go('Tasks')}>Add tasks or time blocks</button></div>}
            {plan.slice(0, 6).map((item, i) => (
              <div className="plan-item" key={item.id}>
                <div className="plan-tile" style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}>{item.tile}</div>
                <div className="plan-text"><b>{item.title}</b><span>{item.sub}</span></div>
                <span className={item.done ? 'tick on' : 'tick'} aria-label={item.done ? 'Done' : 'Not done'}>{item.done && <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 12.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
              </div>
            ))}
          </div>
        </div>

        <WeekPlanner blocks={data.blocks} />
      </div>

      <div className="d-stats">
        <div className="d-card white stat-card">
          <div className="sc-num">{money(cur, inc)}</div>
          <div className="sc-label">INCOME THIS MONTH</div>
          <div className="sc-sub">{chgText(pctChange(inc, incL))}</div>
          <div className="range"><i style={{ left: `${spentPct}%` }} /></div>
          <div className="range-scale"><span>0</span><span>Spent {spentPct}%</span><span>{money(cur, inc)}</span></div>
        </div>
        <div className="d-card cream stat-card">
          <div className="sc-num">{stage('Published')}</div>
          <div className="sc-label">PUBLISHED PIECES</div>
          <div className="sc-sub">+{publishedThisMonth} THIS MONTH</div>
          <button className="pill-btn white" onClick={() => go('Content')}>VIEW ALL</button>
        </div>
        <div className="d-card sand stat-card">
          <div className="sc-num">{groups[1].count}</div>
          <div className="sc-label">IN PRODUCTION</div>
          <div className="sc-sub">{scheduled} SCHEDULED</div>
          <button className="pill-btn white" onClick={() => go('Content')}>VIEW ALL</button>
        </div>
        <div className="d-card glass stat-card">
          <svg className="sparkle" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="rgba(0,0,0,0.3)" /></svg>
          <div className="sc-num">{money(cur, net)}</div>
          <div className="sc-sub">{chgText(pctChange(net, netL))}</div>
          <div className="sc-label dimmer">NET PROFIT</div>
        </div>
        <div className="d-card dark stat-card">
          <div className="sc-num">{unpaid.length}</div>
          <div className="sc-label">UNPAID INVOICES</div>
          <div className="sc-sub">{money(cur, unpaidTotal)} OUTSTANDING</div>
          <button className="pill-btn ghost" onClick={() => go('Finance')}>VIEW ALL</button>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="d-card white">
          <h3>Upcoming publishing</h3>
          {!upcoming.length && <div className="empty">No scheduled content. <button className="link-btn" onClick={() => go('Content')}>Schedule some</button></div>}
          {upcoming.map(c => <div className="item-row" key={c._id}><span>{c.title}</span><span className="dim">{c.platform} · {day(c.publishDate)}</span></div>)}
        </div>
        <div className="d-card white">
          <h3>Outstanding invoices <span className="dim">{unpaid.length}</span></h3>
          {!unpaid.length && <div className="empty">All caught up.</div>}
          {unpaid.slice(0, 5).map(d => <div className="item-row" key={d._id}><span>{d.brandName}</span><span className={d.invoiceStatus === 'Overdue' ? 'bad' : 'dim'}>{money(cur, d.dealValue)} · {d.invoiceStatus}</span></div>)}
        </div>
      </div>
    </>
  );
}

/* ---------- Content ---------- */
export function ContentTab({ data, reload }) {
  const [err, act] = useAct(reload);
  const [f, setF] = useState({ title: '', platform: 'YouTube', stage: 'Idea', description: '', publishDate: '' });
  const [month, setMonth] = useState(new Date());
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const body = { ...f }; if (!body.publishDate) delete body.publishDate;
    if (await act(() => api.addContent(body))) setF({ ...f, title: '', description: '', publishDate: '' });
  };
  const y = month.getFullYear(), m = month.getMonth();
  const cells = [...Array(new Date(y, m, 1).getDay()).fill(null), ...Array(new Date(y, m + 1, 0).getDate()).fill(0).map((_, i) => i + 1)];
  const key = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const drop = (d, e) => {
    const c = data.content.find(x => x._id === e.dataTransfer.getData('id'));
    if (c) act(() => api.updateContent(c._id, { publishDate: key(d), ...(c.stage === 'Idea' ? { stage: 'Scheduled' } : {}) }));
  };
  return (
    <>
      <Err e={err} />
      <Panel title="New content idea">
        <form className="row" onSubmit={add}>
          <input placeholder="Title" value={f.title} onChange={set('title')} style={{ flex: 2 }} />
          <select value={f.platform} onChange={set('platform')}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select>
          <select value={f.stage} onChange={set('stage')}>{STAGES.map(p => <option key={p}>{p}</option>)}</select>
          <input type="date" value={f.publishDate} onChange={set('publishDate')} />
          <input placeholder="Notes" value={f.description} onChange={set('description')} style={{ flex: 2 }} />
          <button>Add</button>
        </form>
      </Panel>
      <Panel title="Production board" count={data.content.length}>
        <div className="board">
          {STAGES.map(s => (
            <div className="col" key={s}><h4>{s} ({data.content.filter(c => c.stage === s).length})</h4>
              {data.content.filter(c => c.stage === s).map(c => (
                <div className="card" key={c._id} draggable onDragStart={(e) => e.dataTransfer.setData('id', c._id)}>
                  <b>{c.title}</b><div className="dim">{c.platform}{c.publishDate && ` · ${day(c.publishDate)}`}</div>
                  {c.description && <div className="dim">{c.description}</div>}
                  <select value={c.stage} onChange={(e) => act(() => api.updateContent(c._id, { stage: e.target.value }))}>{STAGES.map(x => <option key={x}>{x}</option>)}</select>
                  <input type="date" className="sm" style={{ width: '100%', marginTop: 4, background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)' }} value={day(c.publishDate)} onChange={(e) => act(() => api.updateContent(c._id, { publishDate: e.target.value || null }))} />
                  <button className="link-btn delete-btn" onClick={() => act(() => api.deleteContent(c._id))}>Delete</button>
                </div>))}
            </div>))}
        </div>
      </Panel>
      <Panel title="Calendar">
        <div className="row" style={{ alignItems: 'center' }}>
          <button onClick={() => setMonth(new Date(y, m - 1, 1))} style={{ flex: 0 }}>‹</button>
          <b style={{ textAlign: 'center' }}>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))} style={{ flex: 0 }}>›</button>
        </div>
        <div className="cal">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div className="hd" key={i}>{d}</div>)}
          {cells.map((d, i) => d === null ? <div key={i} style={{ visibility: 'hidden' }} /> : (
            <div key={i} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(d, e)}>
              {d}{data.content.filter(c => day(c.publishDate) === key(d)).map(c => <div key={c._id} className="pill" draggable onDragStart={(e) => e.dataTransfer.setData('id', c._id)}>{c.title}</div>)}
            </div>))}
        </div>
        <div className="dim" style={{ marginTop: 8 }}>Tip: drag a card from the board onto a date to schedule it.</div>
      </Panel>
    </>
  );
}

/* ---------- Tasks ---------- */
export function TasksTab({ data, reload }) {
  const [err, act] = useAct(reload);
  const [f, setF] = useState({ title: '', dueDate: '', priority: 'Medium', contentId: '' });
  const [filter, setFilter] = useState('All');
  const [bd, setBd] = useState(today());
  const [b, setB] = useState({ label: '', startTime: '09:00', endTime: '10:00' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const body = { ...f }; if (!body.dueDate) delete body.dueDate; if (!body.contentId) delete body.contentId;
    if (await act(() => api.addTask(body))) setF({ ...f, title: '', dueDate: '' });
  };
  const addBlock = async (e) => {
    e.preventDefault();
    if (!b.label.trim()) return;
    if (await act(() => api.addBlock({ ...b, date: bd }))) setB({ ...b, label: '' });
  };
  const shown = data.tasks.filter(t => ({
    All: true, Active: t.status === 'Active', Completed: t.status === 'Completed',
    High: t.priority === 'High' && t.status === 'Active', 'Due today': day(t.dueDate) === today() && t.status === 'Active'
  }[filter])).sort((a, b) => (a.status === b.status ? 0 : a.status === 'Active' ? -1 : 1));
  const blocks = data.blocks.filter(x => day(x.date) === bd).sort((a, c) => a.startTime.localeCompare(c.startTime));
  return (
    <>
      <Err e={err} />
      <Panel title="New task">
        <form className="row" onSubmit={add}>
          <input placeholder="Task title" value={f.title} onChange={set('title')} style={{ flex: 2 }} />
          <input type="date" value={f.dueDate} onChange={set('dueDate')} />
          <select value={f.priority} onChange={set('priority')}>{['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}</select>
          <select value={f.contentId} onChange={set('contentId')}><option value="">No linked content</option>{data.content.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}</select>
          <button>Add</button>
        </form>
      </Panel>
      <Panel title="Tasks" count={shown.length}>
        <div className="row">{['All', 'Active', 'Completed', 'High', 'Due today'].map(x => <button key={x} className={x === filter ? 'tab on' : 'tab'} style={{ flex: 0 }} onClick={() => setFilter(x)}>{x}</button>)}</div>
        {!shown.length && <div className="empty">No tasks match this filter.</div>}
        {shown.map(t => {
          const late = t.status === 'Active' && t.dueDate && day(t.dueDate) < today();
          return (
            <div className="item-row" key={t._id}>
              <span><input type="checkbox" checked={t.status === 'Completed'} onChange={() => act(() => api.updateTask(t._id, { status: t.status === 'Completed' ? 'Active' : 'Completed' }))} />{' '}
                <span className={t.status === 'Completed' ? 'done' : ''}>{t.title}</span>
                <span className="dim"> · {t.priority}{t.dueDate && ` · due ${day(t.dueDate)}`}{t.contentId && ` · ${t.contentId.title}`}</span>
                {late && <span className="bad"> overdue</span>}</span>
              <span>
                <button className="link-btn" onClick={() => { const v = prompt('Edit task', t.title); if (v && v.trim()) act(() => api.updateTask(t._id, { title: v })); }}>Edit</button>{' '}
                <select value={t.priority} onChange={(e) => act(() => api.updateTask(t._id, { priority: e.target.value }))} className="sm">{['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}</select>{' '}
                <button className="link-btn delete-btn" onClick={() => window.confirm('Delete this task?') && act(() => api.deleteTask(t._id))}>✕</button>
              </span>
            </div>);
        })}
      </Panel>
      <Panel title="Daily routine (time blocks)">
        <form className="row" onSubmit={addBlock}>
          <input type="date" value={bd} onChange={(e) => setBd(e.target.value)} />
          <input type="time" value={b.startTime} onChange={(e) => setB({ ...b, startTime: e.target.value })} />
          <input type="time" value={b.endTime} onChange={(e) => setB({ ...b, endTime: e.target.value })} />
          <input placeholder="e.g. Video filming" value={b.label} onChange={(e) => setB({ ...b, label: e.target.value })} style={{ flex: 2 }} />
          <button>Block time</button>
        </form>
        {!blocks.length && <div className="empty">No time blocks on {bd}.</div>}
        {blocks.map(x => <div className="item-row" key={x._id}><span>{x.startTime}–{x.endTime} · {x.label}</span><button className="link-btn delete-btn" onClick={() => act(() => api.deleteBlock(x._id))}>✕</button></div>)}
      </Panel>
    </>
  );
}

/* ---------- Finance ---------- */
export function FinanceTab({ data, reload, cur }) {
  const [err, act] = useAct(reload);
  const now = new Date();
  const [ym, setYm] = useState(today().slice(0, 7));
  const [f, setF] = useState({ type: 'Income', category: '', amount: '', date: today(), description: '' });
  const [d, setD] = useState({ brandName: '', dealValue: '', deliverables: '', contractStatus: 'Lead', invoiceStatus: 'Pending', dueDate: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sd = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const inM = data.tx.filter(x => day(x.date).startsWith(ym));
  const inc = inM.filter(x => x.type === 'Income').reduce((s, x) => s + x.amount, 0);
  const exp = inM.filter(x => x.type === 'Expense').reduce((s, x) => s + x.amount, 0);
  const add = async (e) => {
    e.preventDefault();
    if (!f.category.trim() || !(+f.amount > 0)) return;
    if (await act(() => api.addTransaction({ ...f, amount: +f.amount }))) setF({ ...f, category: '', amount: '', description: '' });
  };
  const addDeal = async (e) => {
    e.preventDefault();
    if (!d.brandName.trim() || !(+d.dealValue >= 0) || d.dealValue === '') return;
    const body = { ...d, dealValue: +d.dealValue, deliverables: d.deliverables.split(',').map(s => s.trim()).filter(Boolean) };
    if (!body.dueDate) delete body.dueDate;
    if (await act(() => api.addDeal(body))) setD({ ...d, brandName: '', dealValue: '', deliverables: '', dueDate: '' });
  };
  const isLate = (x) => x.invoiceStatus !== 'Paid' && x.dueDate && day(x.dueDate) < today();
  return (
    <>
      <Err e={err} />
      <div className="panel profit-strip" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', padding: 8, borderRadius: 6 }} />
        <Stat v={money(cur, inc)} l="Income" cls="ok" /><Stat v={money(cur, exp)} l="Expenses" cls="bad" /><Stat v={money(cur, inc - exp)} l="Net profit" cls={inc - exp < 0 ? 'bad' : 'ok'} />
      </div>
      <Panel title="Add transaction">
        <form className="row" onSubmit={add}>
          <select value={f.type} onChange={set('type')}><option>Income</option><option>Expense</option></select>
          <input placeholder={f.type === 'Income' ? 'Source (AdSense, Brand Deal…)' : 'Category (Software, Gear…)'} value={f.category} onChange={set('category')} style={{ flex: 2 }} />
          <input type="number" min="0" step="0.01" placeholder="Amount" value={f.amount} onChange={set('amount')} />
          <input type="date" value={f.date} onChange={set('date')} />
          <input placeholder="Note (optional)" value={f.description} onChange={set('description')} style={{ flex: 2 }} />
          <button>Add</button>
        </form>
      </Panel>
      <Panel title="Ledger" count={data.tx.length}>
        {!data.tx.length && <div className="empty">No transactions yet.</div>}
        {data.tx.map(x => (
          <div className="item-row" key={x._id}>
            <span>{day(x.date)} · {x.category}{x.description && <span className="dim"> — {x.description}</span>}</span>
            <span><span className={x.type === 'Income' ? 'ok' : 'bad'}>{x.type === 'Income' ? '+' : '-'}{money(cur, x.amount)}</span>{' '}
              <button className="link-btn delete-btn" onClick={() => act(() => api.deleteTransaction(x._id))}>✕</button></span>
          </div>))}
      </Panel>
      <Panel title="Sponsorship pipeline" count={data.deals.length}>
        <form className="row" onSubmit={addDeal}>
          <input placeholder="Brand" value={d.brandName} onChange={sd('brandName')} />
          <input type="number" min="0" placeholder="Deal value" value={d.dealValue} onChange={sd('dealValue')} />
          <input placeholder="Deliverables (comma separated)" value={d.deliverables} onChange={sd('deliverables')} style={{ flex: 2 }} />
          <select value={d.contractStatus} onChange={sd('contractStatus')}>{['Lead', 'Negotiating', 'Contract Signed', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select>
          <select value={d.invoiceStatus} onChange={sd('invoiceStatus')}>{['Pending', 'Invoiced', 'Paid', 'Overdue'].map(s => <option key={s}>{s}</option>)}</select>
          <input type="date" value={d.dueDate} onChange={sd('dueDate')} title="Invoice due date" />
          <button>Add deal</button>
        </form>
        {!data.deals.length && <div className="empty">No sponsorship deals yet.</div>}
        {data.deals.map(x => (
          <div className="card" key={x._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{x.brandName} · {money(cur, x.dealValue)}</b>
              <button className="link-btn delete-btn" onClick={() => act(() => api.deleteDeal(x._id))}>✕</button></div>
            <div className="dim">{x.deliverables.join(', ') || 'No deliverables listed'}{x.dueDate && ` · invoice due ${day(x.dueDate)}`}</div>
            {isLate(x) && <div className="bad">⚠ Unpaid past due date</div>}
            <div className="row" style={{ margin: '6px 0 0' }}>
              <select value={x.contractStatus} onChange={(e) => act(() => api.updateDeal(x._id, { contractStatus: e.target.value }))}>{['Lead', 'Negotiating', 'Contract Signed', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select>
              <select value={x.invoiceStatus} onChange={(e) => act(() => api.updateDeal(x._id, { invoiceStatus: e.target.value }))}>{['Pending', 'Invoiced', 'Paid', 'Overdue'].map(s => <option key={s}>{s}</option>)}</select>
            </div>
          </div>))}
      </Panel>
    </>
  );
}

/* ---------- Analytics ---------- */
export function AnalyticsTab({ data, cur }) {
  const [analytics, setAnalytics] = useState(null);
  const [financePeriod, setFinancePeriod] = useState('6m');
  const [productivityPeriod, setProductivityPeriod] = useState('7d');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setErr('');
    Promise.all([
      api.financeAnalytics(financePeriod),
      api.productivityAnalytics(productivityPeriod),
      api.contentAnalytics()
    ]).then(([finance, productivity, content]) => {
      if (current) setAnalytics({ finance: finance.data, productivity: productivity.data, content: content.data });
    }).catch(error => {
      if (current) setErr(error.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [data, financePeriod, productivityPeriod]);

  if (err) return <Err e={err} />;
  if (loading || !analytics) return <div className="empty">Loading analytics…</div>;

  const { finance, productivity, content } = analytics;
  const periodKeys = () => {
    if (financePeriod === 'all') return [...new Set(finance.monthly.map(item => item._id.date))].sort();
    if (['7d', '30d', '90d'].includes(financePeriod)) {
      const count = Number.parseInt(financePeriod, 10);
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - count + 1);
      return Array.from({ length: count }, (_, index) => {
        const date = new Date(start); date.setDate(date.getDate() + index);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });
    }
    const count = financePeriod === '12m' ? 12 : 6;
    const start = new Date(); start.setDate(1); start.setMonth(start.getMonth() - count + 1);
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(start); date.setMonth(date.getMonth() + index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
  };
  const transactions = new Map(finance.monthly.map(item => [`${item._id.date}|${item._id.type}`, item.total]));
  const financeRows = periodKeys().map(date => ({
    key: date,
    label: date.length === 7 ? new Date(`${date}-01T00:00:00`).toLocaleString('default', { month: 'short' }) : date.slice(5),
    income: transactions.get(`${date}|Income`) || 0,
    expenses: transactions.get(`${date}|Expense`) || 0
  }));
  const categories = (type) => finance.byCategory.filter(item => item._id.type === type).slice(0, 8)
    .map(item => ({ key: item._id.category, label: item._id.category, amount: item.total }));
  const fmt = (value) => money(cur, Math.round(value));
  const financeSeries = [{ key: 'income', label: 'Income', color: '#5DBFAF' }, { key: 'expenses', label: 'Expenses', color: '#E58FB6' }];
  const dailyRows = productivity.trend.map(item => ({
    key: item.date,
    label: item.date.length > 7 ? item.date.slice(5) : item.date,
    completed: item.completed
  }));
  const countSeries = [{ key: 'count', label: 'Tasks', color: '#111111' }];
  const platformRows = content.platformBreakdown.map(item => ({ key: item._id, label: item._id, published: item.published, planned: item.planned }));
  const platformSeries = [{ key: 'published', label: 'Published', color: '#5DBFAF' }, { key: 'planned', label: 'Planned', color: '#F0C987' }];
  const stageRows = content.stageBreakdown.map(item => ({ key: item._id, label: item._id, count: item.count }));
  const margin = finance.summary.profitMargin;
  const net = finance.summary.netProfit;
  const incomeCats = categories('Income'), expenseCats = categories('Expense');

  return (
    <>
      <header className="analytics-header">
        <div />
        <div className="analytics-filters">
          <label>Financial range<select value={financePeriod} onChange={event => setFinancePeriod(event.target.value)}>
            <option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option>
            <option value="6m">6 months</option><option value="12m">12 months</option><option value="all">All time</option>
          </select></label>
          <label>Productivity range<select value={productivityPeriod} onChange={event => setProductivityPeriod(event.target.value)}>
            <option value="7d">Last week</option><option value="30d">Last month</option>
          </select></label>
        </div>
      </header>

      <div className="dash-grid">
        <div className="kcard hero span2">
          <div className="kl">Net profit</div>
          <div className="kv big">{money(cur, net)}</div>
          <div className="ks">Profit margin {margin}%</div>
          <div className="hero-track"><div style={{ width: `${Math.max(0, Math.min(100, margin))}%` }} /></div>
        </div>
        <KCard cls="teal" label="Income" value={money(cur, finance.summary.totalIncome)} sub="in selected range" spark={<Sparkline values={financeRows.map(r => r.income)} />} />
        <KCard cls="pink" label="Expenses" value={money(cur, finance.summary.totalExpense)} sub="in selected range" spark={<Sparkline values={financeRows.map(r => r.expenses)} />} />

        <DPanel title="Income & expenses" span={2}>
          {financeRows.length ? <><ChartLegend series={financeSeries} /><AreaChart rows={financeRows} series={financeSeries} format={fmt} /></> : <div className="empty">No transactions in this range.</div>}
        </DPanel>
        <DPanel title="Expenses by category" span={2}>
          {expenseCats.length ? <Donut rows={expenseCats} format={fmt} centerLabel="spent" /> : <div className="empty">No expenses recorded in this range.</div>}
        </DPanel>

        <DPanel title="Top revenue streams" span={2}>
          {incomeCats.length ? <Donut rows={incomeCats} format={fmt} centerLabel="earned" /> : <div className="empty">No income recorded in this range.</div>}
        </DPanel>
        <DPanel title="Productivity" sub={productivityPeriod === '7d' ? 'last 7 days' : 'last 30 days'} span={2}>
          <div className="rings">
            <Ring pct={productivity.completionRate} color="#111111" label="Tasks completed" sub={`${productivity.completed} done · ${productivity.active} active`} />
            <Ring pct={productivity.missedRate} color="#FF6B8A" label="Missed deadlines" sub={`${productivity.overdue} overdue`} />
          </div>
          {dailyRows.length ? <GroupedChart rows={dailyRows} series={[{ key: 'completed', label: 'Completed', color: '#111111' }]} format={value => String(Math.round(value))} /> : <div className="empty">No task history yet.</div>}
        </DPanel>

        <DPanel title="Historical time blocks by weekday" span={2}>
          <GroupedChart rows={productivity.routinePattern.map(item => ({ key: item.day, label: item.label, count: item.blocks }))} series={[{ key: 'count', label: 'Time blocks', color: '#8FD3C9' }]} format={value => String(Math.round(value))} />
        </DPanel>
        <DPanel title="Content by production stage" sub={`${content.published} published · ${content.planned} planned`} span={2}>
          {stageRows.length ? <GroupedChart rows={stageRows} series={[{ key: 'count', label: 'Content', color: '#C9D96A' }]} format={value => String(Math.round(value))} /> : <div className="empty">No content stage data yet.</div>}
        </DPanel>

        <DPanel title="Content output by platform" span={4}>
          {platformRows.length ? <><ChartLegend series={platformSeries} /><GroupedChart rows={platformRows} series={platformSeries} format={value => String(Math.round(value))} /></> : <div className="empty">No content planned yet.</div>}
        </DPanel>
      </div>
    </>
  );
}

/* ---------- Profile ---------- */
export function ProfileTab({ user, onUser }) {
  const [p, setP] = useState({ fullName: user.fullName || '', displayName: user.displayName || '', bio: user.bio || '', contentNiche: user.contentNiche || '', profilePicture: user.profilePicture || '', preferredBaseCurrency: user.preferredBaseCurrency || 'USD', ...(user.socialMediaLinks || {}) });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [msg, setMsg] = useState(null);
  const run = async (fn, ok) => { try { await fn(); setMsg({ ok: true, t: ok }); } catch (e) { setMsg({ ok: false, t: e.message }); } };
  const save = (e) => {
    e.preventDefault();
    const { youtube, tiktok, instagram, blog, ...rest } = p;
    run(async () => { const r = await api.updateProfile({ ...rest, socialMediaLinks: { youtube, tiktok, instagram, blog } }); onUser(r.data); }, 'Profile updated');
  };
  const change = (e) => { e.preventDefault(); run(async () => { await api.changePassword(pw); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }); }, 'Password updated successfully'); };
  const pickPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg({ ok: false, t: 'Please choose an image file' }); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg({ ok: false, t: 'Image must be under 10 MB' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 512, c = document.createElement('canvas');
        c.width = c.height = size;
        const s = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        setP((prev) => ({ ...prev, profilePicture: c.toDataURL('image/jpeg', 0.85) }));
      };
      img.onerror = () => setMsg({ ok: false, t: 'Could not read that image' });
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  const F = (k, label, type = 'text') => <label>{label}<input type={type} value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></label>;
  return (
    <>
      {msg && <div className={msg.ok ? 'panel ok' : 'error-box'} style={{ marginBottom: 16 }}>{msg.t}</div>}
      <div className="grid">
        <Panel title="Profile">
          <form className="pf" onSubmit={save}>
            <div className="avatar-row">
              {p.profilePicture
                ? <img className="avatar" src={p.profilePicture} alt="Profile" />
                : <div className="avatar avatar-placeholder">{(p.displayName || p.fullName || '?').charAt(0).toUpperCase()}</div>}
              <div className="avatar-actions">
                <label className="file-btn">Upload photo<input type="file" accept="image/*" onChange={pickPhoto} /></label>
                {p.profilePicture && <button type="button" className="sm" onClick={() => setP({ ...p, profilePicture: '' })}>Remove</button>}
                <span className="hint">JPG or PNG from your computer. Click Save profile to apply.</span>
              </div>
            </div>
            {F('fullName', 'Full name')}{F('displayName', 'Display name')}{F('contentNiche', 'Content niche')}
            <label>Bio<textarea rows="3" value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></label>
            {F('youtube', 'YouTube link')}{F('tiktok', 'TikTok link')}{F('instagram', 'Instagram link')}{F('blog', 'Blog link')}
            <label>Base currency<select value={p.preferredBaseCurrency} onChange={(e) => setP({ ...p, preferredBaseCurrency: e.target.value })}>{['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}</select></label>
            <button>Save profile</button>
          </form>
        </Panel>
        <Panel title="Change password">
          <form className="pf" onSubmit={change}>
            <label>Current password<div className="password-field"><input type={visiblePasswords.currentPassword ? 'text' : 'password'} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /><button className="password-toggle" type="button" aria-label={visiblePasswords.currentPassword ? 'Hide current password' : 'Show current password'} title={visiblePasswords.currentPassword ? 'Hide current password' : 'Show current password'} onClick={() => setVisiblePasswords({ ...visiblePasswords, currentPassword: !visiblePasswords.currentPassword })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg></button></div></label>
            <label>New password<div className="password-field"><input type={visiblePasswords.newPassword ? 'text' : 'password'} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /><button className="password-toggle" type="button" aria-label={visiblePasswords.newPassword ? 'Hide new password' : 'Show new password'} title={visiblePasswords.newPassword ? 'Hide new password' : 'Show new password'} onClick={() => setVisiblePasswords({ ...visiblePasswords, newPassword: !visiblePasswords.newPassword })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg></button></div></label>
            <label>Confirm new password<div className="password-field"><input type={visiblePasswords.confirmPassword ? 'text' : 'password'} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} /><button className="password-toggle" type="button" aria-label={visiblePasswords.confirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} title={visiblePasswords.confirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} onClick={() => setVisiblePasswords({ ...visiblePasswords, confirmPassword: !visiblePasswords.confirmPassword })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg></button></div></label>
            <button>Update password</button>
          </form>
        </Panel>
      </div>
    </>
  );
}
