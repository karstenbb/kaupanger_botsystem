import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playersApi } from '../api/players';
import { finesApi } from '../api/fines';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { IconBack } from '../components/Icons';
import type { Player, Fine } from '../types';

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      playersApi.getById(id),
      finesApi.getAll({ playerId: id }),
    ])
      .then(([p, f]) => {
        setPlayer(p);
        setFines(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleStatus = async (fine: Fine) => {
    const newStatus = fine.status === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      const updated = await finesApi.updateStatus(fine.id, newStatus);
      setFines((prev) => prev.map((f) => (f.id === fine.id ? updated : f)));
      playersApi.getById(id!).then(setPlayer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (fine: Fine) => {
    if (!confirm(`Vil du slette bota "${fine.fineType.name}"?`)) return;
    try {
      await finesApi.delete(fine.id);
      setFines((prev) => prev.filter((f) => f.id !== fine.id));
      playersApi.getById(id!).then(setPlayer);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!player) return <div className="empty-state"><p>Spelar ikkje funnen</p></div>;

  return (
    <>
      <div className="profile-back">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/spelarar')}>
          <IconBack /> Tilbake
        </button>
      </div>

      <div className="profile-header">
        <Avatar name={player.name} size="xl" />
        <div className="profile-info">
          <h3>
            {player.name} {player.number ? `#${player.number}` : ''}
          </h3>
          <p>{player.position || 'Ingen posisjon'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Totalt</div>
          <div className="stat-card-value">{player.totalFines} kr</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Betalt</div>
          <div className="stat-card-value text-paid">{player.totalPaid} kr</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Ubetalt</div>
          <div className="stat-card-value text-unpaid">{player.totalUnpaid} kr</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Antal bøter</div>
          <div className="stat-card-value">{player.fineCount}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Bøtehistorikk</h3>
        <div className="table-wrapper">
          <table className="table-mobile-cards">
            <thead>
              <tr>
                <th>Type</th>
                <th>Beløp</th>
                <th>Tildelt</th>
                <th className="hide-mobile">Betalt dato</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.fineType.name}</div>
                      {f.reason && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {f.reason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{f.amount} kr</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {formatDate(f.date)}
                  </td>
                  <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {f.paidAt ? formatDate(f.paidAt) : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${f.status === 'PAID' ? 'paid' : 'unpaid'}`}>
                      {f.status === 'PAID' ? 'Betalt' : 'Ubetalt'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className={`btn btn-sm ${f.status === 'PAID' ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => toggleStatus(f)}
                        >
                          {f.status === 'PAID' ? 'Angre' : 'Betalt'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(f)}
                          title="Slett bot"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {fines.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted" style={{ padding: 32 }}>
                    Ingen bøter registrerte
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
