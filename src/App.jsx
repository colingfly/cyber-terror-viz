import { useEffect, useState } from 'react';
import Nav, { VIEWS } from './components/Nav';
import Overview from './components/Overview';
import NetworkGraph from './components/NetworkGraph';
import RacingBarChart from './components/RacingBarChart';
import './App.css';

const DEFAULT_VIEW = 'overview';
const VALID_VIEWS = new Set(VIEWS.map(v => v.id));

function readHashView() {
  const hash = (window.location.hash || '').replace(/^#/, '');
  const [view] = hash.split('/');
  return VALID_VIEWS.has(view) ? view : DEFAULT_VIEW;
}

function readHashFocus() {
  const hash = (window.location.hash || '').replace(/^#/, '');
  const [, ...rest] = hash.split('/');
  if (!rest.length) return null;
  try { return decodeURIComponent(rest.join('/')); } catch { return null; }
}

export default function App() {
  const [view, setView]   = useState(() => readHashView());
  const [focus, setFocus] = useState(() => readHashFocus()); // e.g. a node id to open

  const changeView = (next, focusId) => {
    setView(next);
    setFocus(focusId || null);
    const base = `#${next}`;
    const full = focusId ? `${base}/${encodeURIComponent(focusId)}` : base;
    if (window.location.hash !== full) {
      window.history.replaceState(null, '', full);
    }
  };

  useEffect(() => {
    const onHash = () => {
      setView(readHashView());
      setFocus(readHashFocus());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const tab = VIEWS.find(v => v.key === e.key);
      if (tab) { changeView(tab.id); return; }
      if (e.key === 'Escape') {
        const active = document.activeElement;
        if (active && active.blur) active.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openNodeInNetwork = (node) => {
    changeView('network', node.id);
  };

  return (
    <div className="app-shell">
      <Nav view={view} onChange={changeView} />
      <main className="app-view">
        {view === 'overview' && <Overview onOpenNode={openNodeInNetwork} />}
        {view === 'network'  && <NetworkGraph focusId={focus} onFocusHandled={() => setFocus(null)} />}
        {view === 'timeline' && <RacingBarChart />}
      </main>
    </div>
  );
}
