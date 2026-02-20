import { useEffect, useState } from 'react';
import { finesApi } from '../api/fines';
import { fineTypesApi } from '../api/fineTypes';
import { playersApi } from '../api/players';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { IconPlus, IconSearch } from '../components/Icons';
import type { Fine, FineType, Player } from '../types';

export default function FinesPage() {
  const { isAdmin } = useAuth();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [search, setSearch] = useState('');

  // Add fine modal
  const [showAdd, setShowAdd] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [form, setForm] = useState({ playerId: '', fineTypeId: '', reason: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    finesApi.getAll().then(setFines).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAddModal = async () => {
    const [p, ft] = await Promise.all([playersApi.getAll(), fineTypesApi.getAll()]);
    setPlayers(p);
    setFineTypes(ft);
    setShowAdd(true);
  };

  const handleAdd = async () => {
    if (!form.playerId || !form.fineTypeId) return;
    setSaving(true);
    try {
      await finesApi.create({
        playerId: form.playerId,
        fineTypeId: form.fineTypeId,
        reason: form.reason || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      });
      setShowAdd(false);
      setForm({ playerId: '', fineTypeId: '', reason: '', amount: '' });
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (fine: Fine) => {
    const newStatus = fine.status === 'PAID' ? 'UNPAID' : 'PAID';
    const updated = await finesApi.updateStatus(fine.id, newStatus);
    setFines((prev) => prev.map((f) => (f.id === fine.id ? updated : f)));
  };

  const handleDelete = async (fine: Fine) => {
    if (!confirm(`Vil du slette bota "${fine.fineType.name}" for ${fine.player.name}?`)) return;
    try {
      await finesApi.delete(fine.id);
      setFines((prev) => prev.filter((f) => f.id !== fine.id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });

  const filtered = fines
    .filter((f) => filter === 'ALL' || f.status === filter)
    .filter(
      (f) =>
        f.player.name.toLowerCase().includes(search.toLowerCase()) ||
        f.fineType.name.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Bøter</h2>
        <p>{fines.length} totalt registrerte</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <div className="search-wrapper">
            <IconSearch />
            <input
              className="search-input"
              placeholder="Søk etter spelar eller type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <IconPlus /> Ny bot
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table-mobile-cards">
            <thead>
              <tr>
                <th>Spelar</th>
                <th>Type</th>
                <th>Beløp</th>
                <th className="hide-mobile">Dato</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="player-row">
                      <Avatar name={f.player.name} size="sm" />
                      <span style={{ fontWeight: 500 }}>{f.player.name}</span>
                    </div>
                  </td>
                  <td>{f.fineType.name}</td>
                  <td style={{ fontWeight: 600 }}>{f.amount} kr</td>
                  <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {formatDate(f.date)}
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted" style={{ padding: 32 }}>
                    Ingen bøter funne
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal
          title="Registrer ny bot"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>
                Avbryt
              </button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? 'Lagrar…' : 'Registrer'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Spelar</label>
            <select
              className="form-select"
              value={form.playerId}
              onChange={(e) => setForm({ ...form, playerId: e.target.value })}
            >
              <option value="">Vel spelar…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.number ? `#${p.number}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type bot</label>
            <select
              className="form-select"
              value={form.fineTypeId}
              onChange={(e) => {
                const ft = fineTypes.find((f) => f.id === e.target.value);
                setForm({ ...form, fineTypeId: e.target.value, amount: ft ? String(ft.amount) : '' });
              }}
            >
              <option value="">Vel type…</option>
              {fineTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.name} ({ft.amount} kr)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Beløp (kr)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Beløp"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kommentar (valfritt)</label>
            <input
              className="form-input"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ev. kommentar…"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
