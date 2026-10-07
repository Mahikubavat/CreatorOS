import { useEffect, useState } from 'react';
import { api } from './api';


function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 480 380" role="img" aria-label="Creator dashboard illustration">
      <defs>
        <linearGradient id="ha-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#F3F2EC" /></linearGradient>
        <linearGradient id="ha-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E58FB6" /><stop offset="1" stopColor="#C9D96A" /></linearGradient>
        <linearGradient id="ha-play" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF4F8B" /><stop offset="1" stopColor="#FF9F43" /></linearGradient>
      </defs>
      <ellipse cx="240" cy="352" rx="170" ry="14" fill="rgba(0,0,0,0.18)" />
      {/* screen */}
      <rect x="70" y="60" width="340" height="230" rx="18" fill="url(#ha-screen)" />
      <rect x="70" y="60" width="340" height="30" rx="18" fill="#EDECE6" />
      <rect x="70" y="76" width="340" height="14" fill="#EDECE6" />
      <circle cx="92" cy="75" r="5" fill="#E58FB6" /><circle cx="110" cy="75" r="5" fill="#FFC145" /><circle cx="128" cy="75" r="5" fill="#5DBFAF" />
      {/* profit card */}
      <rect x="92" y="108" width="120" height="62" rx="12" fill="#111111" />
      <rect x="104" y="120" width="44" height="7" rx="3.5" fill="rgba(255,255,255,0.6)" />
      <rect x="104" y="136" width="82" height="14" rx="5" fill="#fff" />
      {/* bars */}
      {[38, 62, 46, 84, 70, 100].map((h, i) => <rect key={i} x={232 + i * 27} y={170 - h} width="16" height={h} rx="5" fill="url(#ha-bar)" opacity={0.55 + i * 0.09} />)}
      {/* line chart */}
      <path d="M92 250 C 130 226, 150 262, 190 236 S 262 214, 300 232 S 356 200, 390 214" fill="none" stroke="#5DBFAF" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 250 C 130 226, 150 262, 190 236 S 262 214, 300 232 S 356 200, 390 214 L390 274 L92 274 Z" fill="#5DBFAF" opacity="0.12" />
      <circle cx="390" cy="214" r="7" fill="#fff" stroke="#5DBFAF" strokeWidth="4" />
      {/* stand */}
      <rect x="215" y="290" width="50" height="26" fill="#CFCDC3" />
      <rect x="170" y="312" width="140" height="12" rx="6" fill="#B9B7AC" />
      {/* floating play button */}
      <g className="float-a"><circle cx="86" cy="118" r="38" fill="url(#ha-play)" /><path d="M76 100 L106 118 L76 136 Z" fill="#fff" /></g>
      {/* floating income chip */}
      <g className="float-b"><rect x="330" y="26" width="128" height="44" rx="22" fill="#fff" /><circle cx="354" cy="48" r="13" fill="#5DBFAF" /><path d="M354 41 V55 M348 48 H360" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><rect x="376" y="40" width="60" height="7" rx="3.5" fill="#D9DBE6" /><rect x="376" y="52" width="38" height="7" rx="3.5" fill="#B9BCCB" /></g>
      {/* floating task chip */}
      <g className="float-c"><rect x="16" y="228" width="132" height="44" rx="22" fill="#fff" /><circle cx="40" cy="250" r="13" fill="#111111" /><path d="M33 250 L38 255 L48 244" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /><rect x="62" y="242" width="66" height="7" rx="3.5" fill="#D9DBE6" /><rect x="62" y="254" width="42" height="7" rx="3.5" fill="#B9BCCB" /></g>
      {/* heart / like bubble */}
      <g className="float-a"><circle cx="440" cy="200" r="26" fill="#E58FB6" /><path d="M440 212 C 424 202, 426 188, 435 188 C 438 188, 440 191, 440 191 C 440 191, 442 188, 445 188 C 454 188, 456 202, 440 212 Z" fill="#fff" /></g>
      {/* sparkles */}
      {[[40, 60, 9], [452, 120, 7], [110, 330, 8], [420, 320, 10]].map(([x, y, r], i) => <path key={i} className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x} ${y - r} L${x + r / 3} ${y - r / 3} L${x + r} ${y} L${x + r / 3} ${y + r / 3} L${x} ${y + r} L${x - r / 3} ${y + r / 3} L${x - r} ${y} L${x - r / 3} ${y - r / 3} Z`} fill="#FFE08A" />)}
    </svg>
  );
}

export default function AuthForm({ onAuthed, initialMode = 'login', onModeChange }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contentNiche, setContentNiche] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.login({ email, password })
          : await api.register({ fullName, email, password, contentNiche });
      onAuthed(res.token, res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    onModeChange?.(nextMode);
  };

  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-brand">Creator<span>OS</span></div>
        <div className="hero-copy">
          <h2>Create more.<br />Stress less.</h2>
          <p>Plan your videos, keep your sponsors paid and watch your income grow, all from one calm little corner of the internet.</p>
          <div className="hero-chips"><span>Plan content</span><span>Stay on schedule</span><span>Track earnings</span></div>
        </div>
        <HeroArt />
        <blockquote>“Every big channel started with video number one.”</blockquote>
      </aside>
      <main className="auth-side">
      <div className="auth-wrap">
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="sub">
        {mode === 'login'
          ? 'Log in to see your content, tasks, and finances.'
          : 'Set up CreatorOS to start tracking your work.'}
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={submit}>
        {mode === 'register' && (
          <div>
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        )}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
          </div>
        </div>
        {mode === 'register' && (
          <div>
            <label>Content niche</label>
            <input
              placeholder="e.g. Tech Reviews"
              value={contentNiche}
              onChange={(e) => setContentNiche(e.target.value)}
              required
            />
          </div>
        )}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
      </form>

      <div className="switch-line">
        {mode === 'login' ? (
          <>Don't have an account? <button onClick={() => switchMode('register')}>Register</button></>
        ) : (
          <>Already have an account? <button onClick={() => switchMode('login')}>Log in</button></>
        )}
      </div>
      </div>
      </main>
    </div>
  );
}
