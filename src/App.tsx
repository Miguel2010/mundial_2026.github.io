import { useEffect, useState } from 'react';
import logoUrl from '../logo2026.png';
import { AuthGate } from './features/auth/AuthGate';
import {
  clearSession,
  createSession,
  hasActiveSession,
  verifyPassword,
} from './features/auth/auth';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { fetchClassification } from './services/classification-service';
import { fetchLastUpdateLabel } from './services/github-meta-service';
import type { ClassificationRow } from './types/classification';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasActiveSession());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<ClassificationRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  useEffect(() => {
    void loadLastUpdated();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRows([]);
      setRowsError(null);
      setIsLoadingRows(false);
      return;
    }

    void loadLeaderboard();
  }, [isAuthenticated]);

  async function loadLeaderboard() {
    setIsLoadingRows(true);
    setRowsError(null);

    try {
      const data = await fetchClassification();
      setRows(data);
    } catch (error) {
      setRowsError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la clasificación en este momento.',
      );
    } finally {
      setIsLoadingRows(false);
    }
  }

  async function loadLastUpdated() {
    setIsLoadingMeta(true);

    try {
      const label = await fetchLastUpdateLabel();
      setLastUpdated(label);
    } catch {
      setLastUpdated('No se pudo obtener la fecha de actualización.');
    } finally {
      setIsLoadingMeta(false);
    }
  }

  async function handleLogin(password: string) {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const isValid = await verifyPassword(password);

      if (!isValid) {
        setAuthError('La contraseña no es correcta.');
        return;
      }

      createSession();
      setIsAuthenticated(true);
    } catch {
      setAuthError('No se pudo validar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    setIsAuthenticated(false);
    setAuthError(null);
  }

  return (
    <div className="app-shell">
      <main className="app-layout">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Mundial 2026</span>
            <h1>Clasificación de la porra</h1>
            <div className="hero-meta">
              <div className="meta-card">
                <span className="meta-label">Última actualización</span>
                <strong>
                  {isLoadingMeta ? 'Consultando GitHub...' : lastUpdated ?? 'Sin datos'}
                </strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Participantes</span>
                <strong>{isAuthenticated ? rows.length || '--' : '--'}</strong>
              </div>
            </div>
          </div>
          <div className="hero-logo-wrap">
            <img className="hero-logo" src={logoUrl} alt="Logo del Mundial 2026" />
          </div>
        </section>

        {isAuthenticated ? (
          <LeaderboardPage
            rows={rows}
            isLoading={isLoadingRows}
            error={rowsError}
            lastUpdated={lastUpdated}
            onReload={loadLeaderboard}
            onLogout={handleLogout}
          />
        ) : (
          <AuthGate error={authError} isSubmitting={isSubmitting} onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;
