import { useEffect, useState } from 'react';

const VIEWS = [
  { id: 'overview',  label: 'OVERVIEW',  key: '1' },
  { id: 'network',   label: 'NETWORK',   key: '2' },
  { id: 'timeline',  label: 'TIMELINE',  key: '3' },
];

export default function Nav({ view, onChange }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ts = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z';

  return (
    <nav className="app-nav">
      <div className="app-nav-brand">
        <span className="brand-dot" />
        <span className="brand-mark">CYBER-TERROR-VIZ</span>
        <span className="brand-classification">UNCLASSIFIED / OPEN-SOURCE</span>
      </div>
      <div className="app-nav-tabs">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`app-nav-tab ${view === v.id ? 'active' : ''}`}
            onClick={() => onChange(v.id)}
            title={`Switch to ${v.label} (${v.key})`}
          >
            <span className="tab-key">{v.key}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </div>
      <div className="app-nav-meta">
        <span className="ts-label">UTC</span>
        <span className="ts-value">{ts}</span>
      </div>
    </nav>
  );
}

export { VIEWS };
