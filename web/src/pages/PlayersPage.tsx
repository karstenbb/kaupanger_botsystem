import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playersApi } from '../api/players';
import { finesApi } from '../api/fines';
import { fineTypesApi } from '../api/fineTypes';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { IconSearch, IconPlus } from '../components/Icons';
import type { Player, FineType } from '../types';

export default function PlayersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', birthDate: '', number: '', position: '' });
  const [saving, setSaving] = useState(false);

  // Multi-select & bulk fine
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkFine, setShowBulkFine] = useState(false);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [bulkForm, setBulkForm] = useState({ fineTypeId: '', reason: '', amount: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = () => {
    playersApi.getAll().then(setPlayers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const openBulkFineModal = async () => {
    const ft = await fineTypesApi.getAll();
    setFineTypes(ft);
    setBulkForm({ fineTypeId: '', reason: '', amount: '' });
    setShowBulkFine(true);
  };

  const handleBulkFine = async () => {
    if (!bulkForm.fineTypeId || selected.size === 0) return;
    setBulkSaving(true);
    try {
      await finesApi.bulkCreate({
        playerIds: Array.from(selected),
        fineTypeId: bulkForm.fineTypeId,
        reason: bulkForm.reason || undefined,
        amount: bulkForm.amount ? Number(bulkForm.amount) : undefined,
      });
      setShowBulkFine(false);
      setSelected(new Set());
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await playersApi.create({
        name: form.name.trim(),
        birthDate: form.birthDate || undefined,
        number: form.number ? parseInt(form.number) : undefined,
        position: form.position || undefined,
      });
      setShowAdd(false);
      setForm({ name: '', birthDate: '', number: '', position: '' });
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Spelarar</h2>
        <p>{players.length} registrerte spelarar</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <div className="search-wrapper">
            <IconSearch />
            <input
              className="search-input"
              placeholder="Søk etter spelar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            {selected.size > 0 && (
              <button className="btn btn-primary btn-sm" onClick={openBulkFineModal}>
                🎫 Gi bot ({selected.size})
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <IconPlus /> Legg til
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table-mobile-cards">
            <thead>
              <tr>
                {isAdmin && (
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                      style={{ cursor: 'pointer', width: 18, height: 18 }}
                    />
                  </th>
                )}
                <th>Spelar</th>
                <th className="hide-mobile">Posisjon</th>
                <th className="hide-mobile">Bøter</th>
                <th className="hide-mobile">Totalt</th>
                <th>Ubetalt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="clickable-row"
                  style={selected.has(p.id) ? { background: 'rgba(59,130,246,0.1)' } : {}}
                >
                  {isAdmin && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        style={{ cursor: 'pointer', width: 18, height: 18 }}
                      />
                    </td>
                  )}
                  <td onClick={() => navigate(`/spelarar/${p.id}`)}>
                    <div className="player-row">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.number && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            #{p.number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile" onClick={() => navigate(`/spelarar/${p.id}`)} style={{ color: 'var(--text-secondary)' }}>{p.position || '—'}</td>
                  <td className="hide-mobile" onClick={() => navigate(`/spelarar/${p.id}`)}>{p.fineCount}</td>
                  <td className="hide-mobile" onClick={() => navigate(`/spelarar/${p.id}`)} style={{ fontWeight: 600 }}>{p.totalFines} kr</td>
                  <td onClick={() => navigate(`/spelarar/${p.id}`)}>
                    <span className={p.totalUnpaid > 0 ? 'text-unpaid font-bold' : 'text-paid'}>
                      {p.totalUnpaid} kr
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center text-muted" style={{ padding: 32 }}>
                    Ingen spelarar funne
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal
          title="Legg til spelar"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>
                Avbryt
              </button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? 'Lagrar…' : 'Legg til'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Namn</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Fullt namn"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fødselsdato</label>
            <input
              className="form-input"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nummer</label>
            <input
              className="form-input"
              type="number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              placeholder="Draktnummer"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Posisjon</label>
            <select
              className="form-select"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <option value="">Vel posisjon</option>
              <option value="Keeper">Keeper</option>
              <option value="Forsvar">Forsvar</option>
              <option value="Midtbane">Midtbane</option>
              <option value="Angrep">Angrep</option>
            </select>
          </div>
        </Modal>
      )}

      {showBulkFine && (
        <Modal
          title={`Gi bot til ${selected.size} spelar${selected.size > 1 ? 'ar' : ''}`}
          onClose={() => setShowBulkFine(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowBulkFine(false)}>
                Avbryt
              </button>
              <button className="btn btn-primary" onClick={handleBulkFine} disabled={bulkSaving}>
                {bulkSaving ? 'Lagrar…' : `Gi bot (${selected.size})`}
              </button>
            </>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Valte spelarar:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {players
                .filter((p) => selected.has(p.id))
                .map((p) => (
                  <span
                    key={p.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  >
                    {p.name}
                  </span>
                ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Type bot</label>
            <select
              className="form-select"
              value={bulkForm.fineTypeId}
              onChange={(e) => {
                const ft = fineTypes.find((f) => f.id === e.target.value);
                setBulkForm({ ...bulkForm, fineTypeId: e.target.value, amount: ft ? String(ft.amount) : '' });
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
              value={bulkForm.amount}
              onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
              placeholder="Beløp"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kommentar (valfritt)</label>
            <input
              className="form-input"
              value={bulkForm.reason}
              onChange={(e) => setBulkForm({ ...bulkForm, reason: e.target.value })}
              placeholder="Ev. kommentar…"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
