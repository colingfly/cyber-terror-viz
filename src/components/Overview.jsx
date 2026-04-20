import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = {
  sponsor: '#E0555A',
  actor:   '#6FA7FF',
  victim:  '#3FB37D',
};

export default function Overview({ onOpenNode }) {
  const [sector, setSector]     = useState(null);
  const [geo, setGeo]           = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/sector_network.json').then(r => r.json()),
      fetch('/geo_network.json').then(r => r.json()),
      fetch('/sponsor_timeline.json').then(r => r.json()),
    ])
      .then(([s, g, t]) => {
        if (cancelled) return;
        setSector(s); setGeo(g); setTimeline(t);
      })
      .catch(e => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    if (!sector || !geo || !timeline) return null;

    const topByType = (net, type, n = 8) =>
      (net.nodes || [])
        .filter(nd => nd.type === type)
        .sort((a, b) => b.degree - a.degree)
        .slice(0, n);

    const years = [...new Set(timeline.map(d => d.year))].sort();
    const byYear = years.map(y => {
      const rows = timeline.filter(d => d.year === y);
      const total = rows.reduce((sum, r) => sum + (r.cumulative || 0), 0);
      return { year: y, total };
    });
    const latestYear = years[years.length - 1];
    const latestRows = timeline.filter(d => d.year === latestYear);
    const totalIncidents = latestRows.reduce((s, r) => s + (r.cumulative || 0), 0);

    const topSponsorsCum = latestRows
      .filter(r => r.cumulative > 0)
      .sort((a, b) => b.cumulative - a.cumulative)
      .slice(0, 8);

    return {
      sectorNodes:   sector.nodes.length,
      sectorLinks:   sector.links.length,
      geoNodes:      geo.nodes.length,
      geoLinks:      geo.links.length,
      totalIncidents,
      latestYear,
      byYear,
      topActors:     topByType(sector, 'actor', 8),
      topSectors:    topByType(sector, 'victim', 8),
      topCountries:  topByType(geo, 'victim', 8),
      topSponsorsCum,
    };
  }, [sector, geo, timeline]);

  if (error) {
    return <div className="overview-error">Failed to load data: {error}</div>;
  }

  if (!stats) {
    return (
      <div className="overview-loading">
        <div>LOADING INTELLIGENCE BRIEF…</div>
      </div>
    );
  }

  const handleNode = (id, type) => onOpenNode?.({ id, type });

  return (
    <div className="overview">
      <header className="overview-header">
        <div className="overview-eyebrow">INTELLIGENCE BRIEF</div>
        <h1>STATE-SPONSORED CYBER ATTRIBUTION</h1>
        <p className="overview-lede">
          An open-source network of sponsors, threat actors, and targets derived from
          public attribution reports. Use the tabs above to explore the relationships,
          the timeline of activity, or ask questions in natural language.
        </p>
      </header>

      <section className="stat-grid">
        <Stat label="CUMULATIVE INCIDENTS" value={stats.totalIncidents} sub={`through ${stats.latestYear}`} accent="accent" />
        <Stat label="SPONSORS TRACKED"     value={stats.topSponsorsCum.length > 0 ? new Set(stats.topSponsorsCum.map(r => r.sponsor)).size + '+' : '—'} sub="distinct state sponsors" accent="sponsor" />
        <Stat label="THREAT ACTORS"        value={stats.sectorNodes ? stats.topActors.length + '+' : '—'} sub="groups in sector graph" accent="actor" />
        <Stat label="TARGETS OBSERVED"     value={stats.topSectors.length + stats.topCountries.length + '+'} sub="sectors + countries" accent="victim" />
      </section>

      <section className="overview-chart-block">
        <div className="chart-header">
          <div className="chart-title">CUMULATIVE ATTRIBUTED INCIDENTS · ALL SPONSORS</div>
          <div className="chart-sub">{stats.byYear[0]?.year} — {stats.latestYear}</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.byYear} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="ovTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.actor} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS.actor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1b2635" strokeDasharray="2 3" vertical={false} />
            <XAxis dataKey="year" stroke="#6F87A7" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6F87A7" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#0C1117', border: '1px solid #2A3746', fontSize: 12 }}
              labelStyle={{ color: '#D8E1EA' }}
            />
            <Area type="monotone" dataKey="total" stroke={COLORS.actor} strokeWidth={2} fill="url(#ovTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="overview-columns">
        <RankList
          title="TOP SPONSORS"
          accent="sponsor"
          rows={stats.topSponsorsCum.map(r => ({ id: r.sponsor, value: r.cumulative }))}
          valueLabel="incidents"
          onClickRow={(row) => handleNode(row.id, 'sponsor')}
        />
        <RankList
          title="MOST ACTIVE ACTORS"
          accent="actor"
          rows={stats.topActors.map(n => ({ id: n.id, value: n.degree }))}
          valueLabel="connections"
          onClickRow={(row) => handleNode(row.id, 'actor')}
        />
        <RankList
          title="TOP TARGETED SECTORS"
          accent="victim"
          rows={stats.topSectors.map(n => ({ id: n.id, value: n.degree }))}
          valueLabel="connections"
          onClickRow={(row) => handleNode(row.id, 'victim')}
        />
        <RankList
          title="TOP TARGETED COUNTRIES"
          accent="victim"
          rows={stats.topCountries.map(n => ({ id: n.id, value: n.degree }))}
          valueLabel="connections"
          onClickRow={(row) => handleNode(row.id, 'victim')}
        />
      </section>

      <footer className="overview-footer">
        <div className="overview-footer-line" />
        <div className="overview-footer-text">
          CLICK ANY ROW TO OPEN IT IN THE NETWORK VIEW · DATA IS OPEN-SOURCE AND FOR RESEARCH ONLY
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className={`stat-card stat-${accent || ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function RankList({ title, rows, valueLabel, accent, onClickRow }) {
  const max = Math.max(...rows.map(r => r.value || 0), 1);
  return (
    <div className={`rank-list rank-${accent || ''}`}>
      <div className="rank-title">{title}</div>
      <ol className="rank-rows">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="rank-row"
            onClick={() => onClickRow?.(r)}
            title={`Open ${r.id}`}
          >
            <span className="rank-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="rank-name">{r.id}</span>
            <span className="rank-bar">
              <span className="rank-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
            </span>
            <span className="rank-value">{r.value.toLocaleString()}</span>
          </li>
        ))}
      </ol>
      <div className="rank-legend">{valueLabel}</div>
    </div>
  );
}
