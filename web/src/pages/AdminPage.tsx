import { useEffect, useState } from 'react';
import { fineTypesApi } from '../api/fineTypes';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import type { FineType } from '../types';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FineType | null>(null);
  const [form, setForm] = useState({ name: '', amount: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Automatiske bøter
  const [runningBotfri, setRunningBotfri] = useState(false);
  const [runningForsein, setRunningForsein] = useState(false);
  const [schedulerMsg, setSchedulerMsg] = useState('');

  const load = () => {
    fineTypesApi.getAll().then(setFineTypes).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (!isAdmin) {
    return (
      <div className="card text-center text-muted" style={{ padding: 48 }}>
        Du har ikkje tilgang til denne sida.
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', amount: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (ft: FineType) => {
    setEditing(ft);
    setForm({ name: ft.name, amount: String(ft.amount), description: ft.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    try {
      if (editing) {
        await fineTypesApi.update(editing.id, {
          name: form.name,
          amount: Number(form.amount),
          description: form.description || undefined,
        });
      } else {
        await fineTypesApi.create({
          name: form.name,
          amount: Number(form.amount),
          description: form.description || undefined,
        });
      }
      setShowModal(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne bottypen?')) return;
    try {
      await fineTypesApi.delete(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const runBotfri = async () => {
    setRunningBotfri(true);
    setSchedulerMsg('');
    try {
      const { data } = await client.post('/scheduler/run-botfri');
      setSchedulerMsg(data.message || 'Botfri-sjekk køyrd!');
    } catch {
      setSchedulerMsg('Feil ved køyring av botfri-sjekk');
    } finally {
      setRunningBotfri(false);
    }
  };

  const runForsein = async () => {
    setRunningForsein(true);
    setSchedulerMsg('');
    try {
      const { data } = await client.post('/scheduler/run-forsein');
      setSchedulerMsg(data.message || 'Forsein-sjekk køyrd!');
    } catch {
      setSchedulerMsg('Feil ved køyring av forsein-sjekk');
    } finally {
      setRunningForsein(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Admin</h2>
        <p>Administrer bottypar og automatiske bøter</p>
      </div>

      {/* Automatiske bøter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>⚡ Automatiske bøter</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Desse køyrer automatisk, men du kan også køyre dei manuelt:
          </p>
          <div className="scheduler-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div className="card" style={{ flex: '1 1 250px', padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Botfri månad</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                Spelarar utan bøter denne månaden får 75 kr bot.<br />
                Køyrer automatisk siste dagen kvar månad kl 08:00.
              </p>
              <button className="btn btn-primary btn-sm" onClick={runBotfri} disabled={runningBotfri}>
                {runningBotfri ? 'Køyrer…' : '▶ Køyr no'}
              </button>
            </div>
            <div className="card" style={{ flex: '1 1 250px', padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Forsein betaling</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                Spelarar med ubetalte bøter får 100 kr bot.<br />
                Køyrer automatisk 3. kvar månad kl 08:00.
              </p>
              <button className="btn btn-primary btn-sm" onClick={runForsein} disabled={runningForsein}>
                {runningForsein ? 'Køyrer…' : '▶ Køyr no'}
              </button>
            </div>
          </div>
          {schedulerMsg && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}>
              ✅ {schedulerMsg}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Bottypar</h3>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus /> Ny type
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Namn</th>
                <th>Beløp</th>
                <th>Skildring</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {fineTypes.map((ft) => (
                <tr key={ft.id}>
                  <td style={{ fontWeight: 500 }}>{ft.name}</td>
                  <td style={{ fontWeight: 600 }}>{ft.amount} kr</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {ft.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ft)}>
                        <IconEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ft.id)}>
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {fineTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted" style={{ padding: 32 }}>
                    Ingen bottypar registrerte
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Rediger bottype' : 'Ny bottype'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Avbryt
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Lagrar…' : editing ? 'Oppdater' : 'Opprett'}
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
              placeholder="T.d. Sein til trening"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Beløp (kr)</label>
            <input
              className="form-input"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="100"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Skildring (valfritt)</label>
            <input
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kort forklaring…"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
