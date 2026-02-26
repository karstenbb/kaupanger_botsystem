import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../api/leaderboard';
import Avatar from '../components/Avatar';
import type { LeaderboardEntry } from '../types';
import { formatKr } from '../utils/format';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardApi.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>🏆 Toppliste</h2>
        <p>Kven skuldar mest?</p>
      </div>

      {data.length > 0 ? (
        <div className="card">
          <div className="leaderboard-list">
            {data.map((p, i) => {
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
                      <span style={{ fontSize: 22 }}>{medal}</span>
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
          </div>
        </div>
      ) : (
        <div className="card text-center text-muted" style={{ padding: 48 }}>
          Ingen bøter er registrerte endå.
        </div>
      )}
    </>
  );
}
