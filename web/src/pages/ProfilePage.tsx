import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import type { UpdateProfileBody } from '../api/auth';
import Avatar from '../components/Avatar';
import client from '../api/client';
import { IconCheck } from '../components/Icons';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    name: '',
    position: '',
    number: '',
    birthDate: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      authApi.getProfile().then((profile) => {
        setForm({
          username: profile.username || '',
          email: (profile as { email?: string }).email || '',
          name: profile.player?.name || '',
          position: profile.player?.position || '',
          number: profile.player?.number?.toString() || '',
          birthDate: profile.player?.birthDate
            ? new Date(profile.player.birthDate).toISOString().split('T')[0]
            : '',
          avatarUrl: profile.player?.avatarUrl || '',
          newPassword: '',
          confirmPassword: '',
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    setMessage(null);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passorda samsvarar ikkje' });
      return;
    }

    if (form.newPassword && form.newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Passordet må vere minst 4 teikn' });
      return;
    }

    setSaving(true);
    try {
      const body: UpdateProfileBody = {};
      if (form.username) body.username = form.username;
      if (form.email) body.email = form.email;
      if (form.newPassword) body.password = form.newPassword;
      if (form.name) body.name = form.name;
      if (form.position !== undefined) body.position = form.position;
      if (form.number) body.number = Number(form.number);
      if (form.birthDate) body.birthDate = form.birthDate;

      if (form.avatarUrl) body.avatarUrl = form.avatarUrl;
      await authApi.updateProfile(body);
      await refreshProfile();
      setForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Profilen din er oppdatert!' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Klarte ikkje oppdatere profil',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Min profil</h2>
        <p>Rediger profilinfo og passord</p>
      </div>

      <div className="profile-page-grid">
        {/* Profile card */}
        <div className="card profile-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 24px' }}>
            <Avatar name={form.name || user?.username || '?'} size="lg" src={form.avatarUrl} />
            <form style={{ marginTop: 12, marginBottom: 8, textAlign: 'center' }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                onChange={async (e) => {
                  if (!e.target.files || !e.target.files[0]) return;
                  const file = e.target.files[0];
                  const formData = new FormData();
                  formData.append('image', file);
                  setMessage(null);
                  try {
                    const res = await client.post('/upload/profile-image', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    setForm((f) => ({ ...f, avatarUrl: res.data.url }));
                    setMessage({ type: 'success', text: 'Profilbilde lasta opp!' });
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Klarte ikkje laste opp bilde' });
                  }
                }}
              />
              <label htmlFor="profile-image-upload" className="btn btn-secondary" style={{ marginTop: 8, cursor: 'pointer' }}>
                Last opp profilbilde
              </label>
              {form.avatarUrl && (
                <button type="button" className="btn btn-link" style={{ color: '#ef4444', marginLeft: 8 }}
                  onClick={() => setForm((f) => ({ ...f, avatarUrl: '' }))}>
                  Fjern bilde
                </button>
              )}
            </form>
            <h3 style={{ marginTop: 16, fontSize: 20 }}>{form.name || user?.username}</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {user?.role === 'ADMIN' ? '🛡️ Administrator' : '⚽ Spelar'}
            </span>
            {form.position && (
              <span style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                {form.position} {form.number ? `· #${form.number}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <div className="card-header">
            <h3>Rediger profil</h3>
          </div>
          <div style={{ padding: '16px 20px 24px' }}>
            {message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: message.type === 'success' ? '#10b981' : '#ef4444',
                  border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                }}
              >
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <div className="profile-form-grid">
              <div className="form-group">
                <label className="form-label">Brukarnamn</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">E-post</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fullt namn</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Posisjon</label>
                <input
                  className="form-input"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="T.d. Midtbane"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Drakt nr.</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="T.d. 10"
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
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

            <h4 style={{ fontSize: 15, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Endre passord (valfritt)
            </h4>
            <div className="profile-form-grid">
              <div className="form-group">
                <label className="form-label">Nytt passord</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="La stå tomt for å behalde"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bekreft passord</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Skriv passordet på nytt"
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: 16 }}
            >
              {saving ? 'Lagrar…' : (
                <>
                  <IconCheck /> Lagre endringar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
