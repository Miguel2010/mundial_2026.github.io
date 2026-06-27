import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import logoUrl from '../fifa-logo-transparent-white.webp';
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

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

function App() {
  const [currentParticipant, setCurrentParticipant] = useState(
    () => getActiveSession()?.participante ?? null,
  );
  const isAuthenticated = currentParticipant !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<ClassificationRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
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
      void loadParticipants();
      return;
    }

    if (rows.length === 0) {
      void loadLeaderboard();
    }

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

  async function loadParticipants() {
    setIsLoadingParticipants(true);
    setParticipantsError(null);

    try {
      const data = await fetchClassification();
      setRows(data);
    } catch (error) {
      setParticipantsError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la lista de participantes.',
      );
    } finally {
      setIsLoadingParticipants(false);
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
        setAuthError('Contraseña incorrecta.');
        return;
      }

      const matchingRow = rows.find((row) => row.participante === credentials.participante);

      if (!matchingRow) {
        setAuthError('Selecciona un participante válido.');
        return;
      }

      createSession({ participante: matchingRow.participante });
      setCurrentParticipant(matchingRow.participante);
    } catch {
      setAuthError('No se pudo validar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    setIsMobileMenuOpen(false);
    setCurrentParticipant(null);
    setAuthError(null);
    lastUpdatedIsoRef.current = null;
  }

  function handleSelectNavigationItem() {
    setIsMobileMenuOpen(false);
  }

  function renderTopNavigation() {
    if (!isAuthenticated || !currentParticipant) {
      return null;
    }

    return (
      <header className="top-navigation" aria-label="Navegación principal">
        <div className="top-navigation-brand">
          <img src={logoUrl} alt="" />
          <span>Mundial 2026</span>
        </div>

        <button
          aria-controls="main-navigation-menu"
          aria-expanded={isMobileMenuOpen}
          className="top-navigation-toggle ghost-button"
          type="button"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
        >
          Menú
        </button>

        <div
          className={`top-navigation-menu${isMobileMenuOpen ? ' top-navigation-menu-open' : ''}`}
          id="main-navigation-menu"
        >
          <nav className="tabs app-navigation" aria-label="Secciones de la clasificación">
            <NavLink
              className={({ isActive }) => `tab-button${isActive ? ' tab-button-active' : ''}`}
              to="/clasificacion"
              onClick={handleSelectNavigationItem}
            >
              Clasificación
            </NavLink>
            <NavLink
              className={({ isActive }) => `tab-button${isActive ? ' tab-button-active' : ''}`}
              to="/pronostico"
              onClick={handleSelectNavigationItem}
            >
              Pronóstico
            </NavLink>
            <NavLink
              className={({ isActive }) => `tab-button${isActive ? ' tab-button-active' : ''}`}
              to="/premios"
              onClick={handleSelectNavigationItem}
            >
              Premios
            </NavLink>
            <NavLink
              className={({ isActive }) => `tab-button${isActive ? ' tab-button-active' : ''}`}
              to="/puntuacion"
              onClick={handleSelectNavigationItem}
            >
              Puntuación y desempate
            </NavLink>
          </nav>

          <div className="top-navigation-session">
            <span className="session-label">Conectado como {currentParticipant}</span>
            <button className="ghost-button" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="app-shell">
      {renderTopNavigation()}

      <main className="app-layout">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Mundial 2026</span>
            <h1>Clasificación General</h1>
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

        {isAuthenticated && currentParticipant ? (
          <Routes>
            <Route
              path="/*"
              element={
                <LeaderboardPage
                  rows={rows}
                  isLoading={isLoadingRows}
                  error={rowsError}
                  currentParticipant={currentParticipant}
                />
              }
            />
          </Routes>
        ) : (
          <AuthGate
            error={authError}
            isLoadingParticipants={isLoadingParticipants}
            isSubmitting={isSubmitting}
            participants={rows.map((row) => row.participante)}
            participantsError={participantsError}
            onLogin={handleLogin}
            onRetryParticipants={loadParticipants}
          />
        )}
      </main>
      {isAuthenticated ? null : (
        <Routes>
          <Route path="/" element={null} />
          <Route path="/clasificacion" element={null} />
          <Route path="/pronostico" element={null} />
          <Route path="/premios" element={null} />
          <Route path="/puntuacion" element={null} />
          <Route path="*" element={<Navigate to="/clasificacion" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
