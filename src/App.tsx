import { useEffect, useRef, useState } from 'react';
import logoUrl from '../logo2026.png';
import { AuthGate } from './features/auth/AuthGate';
import {
  clearSession,
  createSession,
  getActiveSession,
  verifyPassword,
} from './features/auth/auth';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { fetchClassification } from './services/classification-service';
import { fetchCsvUpdateInfo } from './services/github-meta-service';
import type { ClassificationRow } from './types/classification';
import { normalizeParticipantName } from './utils/participants';

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

function App() {
  const [currentParticipant, setCurrentParticipant] = useState(
    () => getActiveSession()?.participante ?? null,
  );
  const isAuthenticated = currentParticipant !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<ClassificationRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const lastUpdatedIsoRef = useRef<string | null>(null);
  const isCheckingUpdatesRef = useRef(false);

  useEffect(() => {
    void syncLastUpdated();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRows([]);
      setRowsError(null);
      setIsLoadingRows(false);
      return;
    }

    void loadLeaderboard();
    void syncLastUpdated();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const checkForUpdates = async () => {
      if (isCheckingUpdatesRef.current) {
        return;
      }

      isCheckingUpdatesRef.current = true;

      try {
        const updateInfo = await fetchCsvUpdateInfo();

        setLastUpdated(updateInfo.updatedAtLabel);

        if (lastUpdatedIsoRef.current !== updateInfo.updatedAtIso) {
          lastUpdatedIsoRef.current = updateInfo.updatedAtIso;
          await loadLeaderboard();
        }
      } catch {
        setLastUpdated((currentValue) =>
          currentValue ?? 'No se pudo obtener la fecha de actualización.',
        );
      } finally {
        isCheckingUpdatesRef.current = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, UPDATE_CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };

    const handleWindowFocus = () => {
      void checkForUpdates();
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
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

  async function syncLastUpdated() {
    setIsLoadingMeta(true);

    try {
      const updateInfo = await fetchCsvUpdateInfo();
      lastUpdatedIsoRef.current = updateInfo.updatedAtIso;
      setLastUpdated(updateInfo.updatedAtLabel);
    } catch {
      setLastUpdated('No se pudo obtener la fecha de actualización.');
    } finally {
      setIsLoadingMeta(false);
    }
  }

  async function handleLogin(credentials: { participante: string; password: string }) {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const isValid = await verifyPassword(credentials.password);

      if (!isValid) {
        setAuthError('La contraseña o el participante no son correctos.');
        return;
      }

      const data = await fetchClassification();
      const normalizedParticipant = normalizeParticipantName(credentials.participante);
      const matchingRow = data.find(
        (row) => normalizeParticipantName(row.participante) === normalizedParticipant,
      );

      if (!matchingRow) {
        setAuthError('La contraseña o el participante no son correctos.');
        return;
      }

      createSession({ participante: matchingRow.participante });
      setRows(data);
      setCurrentParticipant(matchingRow.participante);
    } catch {
      setAuthError('No se pudo cargar la lista de participantes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    setCurrentParticipant(null);
    setAuthError(null);
    lastUpdatedIsoRef.current = null;
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
              {isAuthenticated ? (
                <div className="meta-card">
                  <span className="meta-label">Participantes</span>
                  <strong>{rows.length || '--'}</strong>
                </div>
              ) : null}
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
            currentParticipant={currentParticipant}
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
