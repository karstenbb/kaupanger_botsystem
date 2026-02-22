import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API = process.env.REACT_APP_API_URL || '/api';

interface PublicFine {
  id: string;
  amount: number;
  reason: string | null;
  status: 'PAID' | 'UNPAID';
  date: string;
  player: { id: string; name: string; number: number | null };
  fineType: { id: string; name: string };
}

interface Summary {
  totalFines: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  totalPlayers: number;
  topPlayers: { name: string; total: number; count: number }[];
}

interface PublicFineType {
  id: string;
  name: string;
  amount: number;
  description: string | null;
}

export default function PublicFinesPage() {
  const [fines, setFines] = useState<PublicFine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fineTypes, setFineTypes] = useState<PublicFineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'fines' | 'types'>('fines');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/public/fines`),
      axios.get(`${API}/public/summary`),
      axios.get(`${API}/public/fine-types`),
    ])
      .then(([finesRes, summaryRes, typesRes]) => {
        setFines(finesRes.data);
        setSummary(summaryRes.data);
        setFineTypes(typesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatKr = (n: number) => `${(n ?? 0).toLocaleString('nb-NO')} kr`;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = fines
    .filter((f) => filter === 'ALL' || f.status === filter)
    .filter(
      (f) =>
        f.player.name.toLowerCase().includes(search.toLowerCase()) ||
        f.fineType.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="public-page">
      {/* Header */}
      <header className="public-header">
        <div className="public-header-inner">
          <div className="public-header-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              <path d="M2 12h20" />
            </svg>
            <div>
              <h1>Kaupanger Botsystem</h1>
              <span>Offentleg oversikt</span>
            </div>
          </div>
          <Link to="/login" className="public-login-link">
            Logg inn →
          </Link>
        </div>
      </header>

      <main className="public-main">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            {summary && (
              <div className="public-stats">
                <div className="public-stat-card">
                  <div className="public-stat-value">{summary.totalFines}</div>
                  <div className="public-stat-label">Bøter totalt</div>
                </div>
                <div className="public-stat-card">
                  <div className="public-stat-value">{formatKr(summary.totalAmount)}</div>
                  <div className="public-stat-label">Totalt beløp</div>
                </div>
                <div className="public-stat-card public-stat-paid">
                  <div className="public-stat-value">{formatKr(summary.paidAmount)}</div>
                  <div className="public-stat-label">Betalt</div>
                </div>
                <div className="public-stat-card public-stat-unpaid">
                  <div className="public-stat-value">{formatKr(summary.unpaidAmount)}</div>
                  <div className="public-stat-label">Ubetalt</div>
                </div>
              </div>
            )}

            {/* Top offenders mini */}
            {summary && summary.topPlayers.length > 0 && (
              <div className="public-card public-top-card">
                <h3>🏆 Verstingane</h3>
                <div className="public-top-list">
                  {summary.topPlayers.map((p, i) => (
                    <div key={i} className="public-top-row">
                      <span className="public-top-rank">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                      </span>
                      <span className="public-top-name">{p.name}</span>
                      <span className="public-top-count">{p.count} bøter</span>
                      <span className="public-top-amount">{formatKr(p.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="public-tabs">
              <button
                className={`public-tab${tab === 'fines' ? ' active' : ''}`}
                onClick={() => setTab('fines')}
              >
                📋 Registrerte bøter
              </button>
              <button
                className={`public-tab${tab === 'types' ? ' active' : ''}`}
                onClick={() => setTab('types')}
              >
                📖 Bottypar ({fineTypes.length})
              </button>
            </div>

            {tab === 'types' ? (
              /* Fine types overview */
              <div className="public-card">
                <div className="table-wrapper">
                  <table className="public-table">
                    <thead>
                      <tr>
                        <th>Namn</th>
                        <th>Beløp</th>
                        <th>Skildring</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fineTypes.map((ft) => (
                        <tr key={ft.id}>
                          <td style={{ fontWeight: 600 }}>{ft.name}</td>
                          <td className="public-amount">{ft.amount} kr</td>
                          <td className="public-date">{ft.description || '—'}</td>
                        </tr>
                      ))}
                      {fineTypes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted" style={{ padding: 48 }}>
                            Ingen bottypar registrerte
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            <>
            {/* Search & filter */}
            <div className="public-toolbar">
              <div className="public-search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="public-search"
                  placeholder="Søk spelar eller type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-pills">
                {(['ALL', 'UNPAID', 'PAID'] as const).map((f) => (
                  <button
                    key={f}
                    className={`filter-pill${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'ALL' ? 'Alle' : f === 'PAID' ? 'Betalte' : 'Ubetalte'}
                  </button>
                ))}
              </div>
              <span className="public-count">
                {filtered.length} {filtered.length === 1 ? 'bot' : 'bøter'}
              </span>
            </div>

            {/* Fines table */}
            <div className="public-card">
              <div className="table-wrapper">
                <table className="public-table">
                  <thead>
                    <tr>
                      <th>Spelar</th>
                      <th>Type</th>
                      <th>Beløp</th>
                      <th className="hide-mobile">Dato</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className="public-player">
                            <div className="public-avatar">
                              {f.player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="public-player-name">{f.player.name}</div>
                              {f.player.number && (
                                <div className="public-player-num">#{f.player.number}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="public-type">{f.fineType.name}</span>
                          {f.reason && (
                            <span className="public-reason">{f.reason}</span>
                          )}
                        </td>
                        <td className="public-amount">{f.amount} kr</td>
                        <td className="hide-mobile public-date">{formatDate(f.date)}</td>
                        <td>
                          <span className={`badge badge-${f.status === 'PAID' ? 'paid' : 'unpaid'}`}>
                            {f.status === 'PAID' ? 'Betalt' : 'Ubetalt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted" style={{ padding: 48 }}>
                          Ingen bøter funne
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}

            {/* Footer */}
            <footer className="public-footer">
              <p>Kaupanger IL · Botsystem</p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
