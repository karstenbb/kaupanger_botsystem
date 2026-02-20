import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconFootball, IconCheck } from '../components/Icons';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [position, setPosition] = useState('');
  const [number, setNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setBirthDate('');
    setPosition('');
    setNumber('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = () => {
    resetForm();
    setIsRegister((v) => !v);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Skriv inn brukarnamn og passord');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Innlogging feila. Sjekk tilkoplinga.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Brukarnamn er påkrevd');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Passordet må vere minst 4 teikn');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passorda stemmer ikkje');
      return;
    }
    if (!name.trim()) {
      setError('Fullt namn er påkrevd');
      return;
    }
    if (!birthDate) {
      setError('Fødselsdato er påkrevd');
      return;
    }
    if (!number.trim()) {
      setError('Draktnummer er påkrevd');
      return;
    }
    if (!position) {
      setError('Posisjon er påkrevd');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        username: username.trim(),
        password,
        name: name.trim(),
        birthDate,
        position,
        number: parseInt(number),
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registrering feila. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <IconFootball />
          </div>
          <h1>Kaupanger IL</h1>
          <p>Bøtesystem</p>
        </div>

        {!isRegister ? (
          <>
            <div className="login-welcome">
              <h2>Velkomen tilbake</h2>
              <p>Logg inn for å sjå bøtekassen</p>
              <div className="login-features">
                <div className="login-feature">
                  <IconCheck /> <span>Sjekk kva du skuldar</span>
                </div>
                <div className="login-feature">
                  <IconCheck /> <span>Sjå kven som toppar lista</span>
                </div>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Brukar</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Brukarnamn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Passord</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Skriv inn passord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={loading}
                style={{ marginTop: 8, height: 48 }}
              >
                {loading ? 'Logger inn…' : 'Logg inn'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
              Har du ikkje brukar?{' '}
              <button
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Opprett konto
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="login-welcome">
              <h2>Opprett konto</h2>
              <p>Registrer deg som spelar</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Brukarnamn *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Vel eit brukarnamn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Passord *</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Minst 4 teikn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gjenta passord *</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Skriv passordet igjen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Spelarinfo</p>

              <div className="form-group">
                <label className="form-label">Fullt namn *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Fornavn Etternavn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fødselsdato *</label>
                <input
                  className="form-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Draktnummer *</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="#"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    min={1}
                    max={99}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Posisjon *</label>
                  <select
                    className="form-select"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="">Vel posisjon</option>
                    <option value="Keeper">Keeper</option>
                    <option value="Forsvar">Forsvar</option>
                    <option value="Midtbane">Midtbane</option>
                    <option value="Angrep">Angrep</option>
                  </select>
                </div>
              </div>
              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={loading}
                style={{ marginTop: 8, height: 48 }}
              >
                {loading ? 'Opprettar…' : 'Opprett konto'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
              Har du allereie ein brukar?{' '}
              <button
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Logg inn
              </button>
            </p>
          </>
        )}

        <p className="login-footer">Kaupanger IL • Bøtesystem v1.0</p>
      </div>
    </div>
  );
}
