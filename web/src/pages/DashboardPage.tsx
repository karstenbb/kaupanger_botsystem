import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { leaderboardApi } from '../api/leaderboard';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import type { DashboardData, LeaderboardEntry } from '../types';
import { formatKr } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.get(),
      leaderboardApi.get().catch(() => [] as LeaderboardEntry[]),
    ])
      .then(([d, lb]) => { setData(d); setTopPlayers(lb); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><p>Kunne ikkje laste data</p></div>;

  return (
    <>
      <div className="page-header">
        <h2>Hei, {user?.username} 👋</h2>
        <p>Her er oversikta over bøtekassen</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Totalt bøter</div>
          <div className="stat-card-value">{data.stats.totalFinesCount}</div>
          <div className="stat-card-sub">registrerte bøter</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Totalt beløp</div>
          <div className="stat-card-value">{formatKr(data.stats.totalAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Betalt</div>
          <div className="stat-card-value text-paid">{formatKr(data.stats.paidAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Ubetalt</div>
          <div className="stat-card-value text-unpaid">{formatKr(data.stats.unpaidAmount)}</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Recent fines */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Siste bøter</h3>
          <div className="table-wrapper">
            <table className="table-mobile-cards">
              <thead>
                <tr>
                  <th>Spelar</th>
                  <th className="hide-mobile">Type</th>
                  <th>Beløp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentFines.slice(0, 8).map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="player-row">
                        <Avatar name={f.player.name} size="sm" />
                        <span>{f.player.name}</span>
                      </div>
                    </td>
                    <td className="hide-mobile">{f.fineType.name}</td>
                    <td style={{ fontWeight: 600 }}>{f.amount} kr</td>
                    <td>
                      <span className={`badge badge-${f.status === 'PAID' ? 'paid' : 'unpaid'}`}>
                        {f.status === 'PAID' ? 'Betalt' : 'Ubetalt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top offenders */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🏆 Toppliste</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Kven skuldar mest?</p>
          <div className="leaderboard-list">
            {topPlayers.slice(0, 10).map((p, i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              const isTop3 = i < 3;
              return (
                <div
                  key={p.id}
                  className={`leaderboard-row${isTop3 ? ' leaderboard-top3' : ''}`}
                  onClick={() => navigate(`/spelarar/${p.id}`)}
                >
                  <div className="leaderboard-rank">
                    {medal ? (
                      <span style={{ fontSize: 20 }}>{medal}</span>
                    ) : (
                      <span className="leaderboard-rank-num">{i + 1}</span>
                    )}
                  </div>
                  <Avatar name={p.name} size="sm" />
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{p.name}</div>
                    <div className="leaderboard-sub">
                      {p.fineCount} bøter · {formatKr(p.unpaidAmount)} ubetalt
                    </div>
                  </div>
                  <div className="leaderboard-amount">{formatKr(p.totalAmount)}</div>
                  <span className="leaderboard-arrow">›</span>
                </div>
              );
            })}
            {topPlayers.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                Ingen bøter registrerte enno
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
