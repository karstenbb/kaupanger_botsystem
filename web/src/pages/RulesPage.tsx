import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API = process.env.REACT_APP_API_URL || '/api';

/**
 * Render markdown-ish text to HTML.
 * Supports: # headings, ## headings, **bold**, - bullets, ---, blank-line paragraphs
 */
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inUl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      if (inUl) { html += '</ul>'; inUl = false; }
      html += '<hr/>';
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inUl) { html += '</ul>'; inUl = false; }
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<h1>${text}</h1>`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inUl) { html += '</ul>'; inUl = false; }
      const text = line.slice(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<h2>${text}</h2>`;
      continue;
    }

    // Bullet list
    if (/^- /.test(line)) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${text}</li>`;
      continue;
    }

    // Close list if open
    if (inUl) { html += '</ul>'; inUl = false; }

    // Blank line
    if (line.trim() === '') {
      continue;
    }

    // Normal paragraph — collect consecutive non-blank lines
    let para = line;
    while (i + 1 < lines.length && lines[i + 1].trim() !== '' && !lines[i + 1].startsWith('#') && !lines[i + 1].startsWith('- ') && !/^-{3,}$/.test(lines[i + 1].trim())) {
      i++;
      para += '<br/>' + lines[i];
    }
    para = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html += `<p>${para}</p>`;
  }

  if (inUl) html += '</ul>';
  return html;
}

interface RulesPageProps {
  /** If true the page is shown in public (read-only) mode with its own header */
  isPublic?: boolean;
}

export default function RulesPage({ isPublic = false }: RulesPageProps) {
  const [content, setContent] = useState('');
  const [draft, setDraft] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(() => {
    axios
      .get(`${API}/public/rules`)
      .then((res) => {
        setContent(res.data.content ?? '');
        setUpdatedAt(res.data.updatedAt ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const startEdit = () => {
    setDraft(content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await client.put('/rules', { content: draft });
      setContent(res.data.content);
      setUpdatedAt(res.data.updatedAt);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Klarte ikkje lagre.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  // Public layout (standalone page like /offentleg)
  if (isPublic) {
    return (
      <div className="public-page">
        <main className="public-main">
          <header className="public-header">
            <div>
              <h1 className="public-title">📜 Botsystemreglar</h1>
              <p className="public-subtitle">Kaupanger IL — Regelverk</p>
            </div>
            <a href="/offentleg" className="public-login-link">← Tilbake</a>
          </header>

          <div className="rules-card">
            <div
              className="rules-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
            {updatedAt && (
              <p className="rules-updated">
                Sist oppdatert: {new Date(updatedAt).toLocaleDateString('nb-NO')}
              </p>
            )}
          </div>

          <footer className="public-footer">
            <p>Kaupanger IL · Botsystem</p>
          </footer>
        </main>
      </div>
    );
  }

  // Authenticated layout — render via wrapper that provides isAdmin
  return (
    <AuthenticatedRules
      content={content}
      draft={draft}
      setDraft={setDraft}
      updatedAt={updatedAt}
      editing={editing}
      setEditing={setEditing}
      saving={saving}
      saveEdit={saveEdit}
      startEdit={startEdit}
      cancelEdit={cancelEdit}
    />
  );
}

/* ── Inner component that may call useAuth ─────────────────────────── */
function AuthenticatedRules({
  content, draft, setDraft, updatedAt, editing, setEditing,
  saving, saveEdit, startEdit, cancelEdit,
}: {
  content: string;
  draft: string;
  setDraft: (v: string) => void;
  updatedAt: string | null;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saving: boolean;
  saveEdit: () => void;
  startEdit: () => void;
  cancelEdit: () => void;
}) {
  const { isAdmin } = useAuth();

  return (
    <div className="rules-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📜 Botsystemreglar</h1>
          {updatedAt && (
            <p className="page-subtitle">
              Sist oppdatert: {new Date(updatedAt).toLocaleDateString('nb-NO')}
            </p>
          )}
        </div>
        {isAdmin && !editing && (
          <button className="btn btn-primary" onClick={startEdit}>
            ✏️ Rediger
          </button>
        )}
      </div>

      {editing ? (
        <div className="rules-edit-area">
          <textarea
            className="rules-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={30}
          />
          <div className="rules-edit-actions">
            <button className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
              Avbryt
            </button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Lagrar…' : '💾 Lagre'}
            </button>
          </div>
          <div className="rules-preview">
            <h3>Førehandsvising</h3>
            <div
              className="rules-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(draft) }}
            />
          </div>
        </div>
      ) : (
        <div className="rules-card">
          <div
            className="rules-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>
      )}
    </div>
  );
}

/** Wrapper so we don't call useAuth() at top-level on public page */
function useAuthSafe() {
  return useAuth();
}
