import { useEffect, useState } from 'react';
import { finesApi } from '../api/fines';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import type { Fine } from '../types';

export default function MyFinesPage() {
  const { user } = useAuth();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  useEffect(() => {
    if (!user?.playerId) {
      setLoading(false);
      return;
    }
    finesApi
      .getAll({ playerId: user.playerId })
      .then(setFines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.playerId]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = fines.filter((f) => filter === 'ALL' || f.status === filter);

  const totalAmount = fines.reduce((s, f) => s + f.amount, 0);
  const unpaidAmount = fines.filter((f) => f.status === 'UNPAID').reduce((s, f) => s + f.amount, 0);
  const paidAmount = fines.filter((f) => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  if (!user?.playerId) {
    return (
      <>
        <div className="page-header">
          <h2>Mine bøter</h2>
          <p>Kontoen din er ikkje kopla til ein spelar.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Mine bøter</h2>
        <p>Oversikt over bøtene dine</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Totalt</div>
          <div className="stat-card-value">{totalAmount} kr</div>
          <div className="stat-card-sub">{fines.length} bøter</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Ubetalt</div>
          <div className="stat-card-value" style={{ color: 'var(--unpaid)' }}>{unpaidAmount} kr</div>
          <div className="stat-card-sub">{fines.filter((f) => f.status === 'UNPAID').length} bøter</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Betalt</div>
          <div className="stat-card-value" style={{ color: 'var(--paid)' }}>{paidAmount} kr</div>
          <div className="stat-card-sub">{fines.filter((f) => f.status === 'PAID').length} bøter</div>
        </div>
      </div>

      {/* Filter */}
      <div className="toolbar">
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
      </div>

      {/* Fines list */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table-mobile-cards">
            <thead>
              <tr>
                <th>Type</th>
                <th>Beløp</th>
                <th className="hide-mobile">Kommentar</th>
                <th className="hide-mobile">Dato</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500 }}>{f.fineType.name}</td>
                  <td style={{ fontWeight: 600 }}>{f.amount} kr</td>
                  <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {f.reason || '—'}
                  </td>
                  <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {formatDate(f.date)}
                  </td>
                  <td>
                    <span className={`badge badge-${f.status === 'PAID' ? 'paid' : 'unpaid'}`}>
                      {f.status === 'PAID' ? 'Betalt' : 'Ubetalt'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>
                    {fines.length === 0
                      ? 'Du har ingen bøter — bra jobba! 🎉'
                      : 'Ingen bøter i denne kategorien'}
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
