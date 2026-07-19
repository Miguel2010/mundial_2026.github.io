import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LeaderboardTable } from './LeaderboardTable';
import { PrizesPanel } from '../prizes/PrizesPanel';
import { PredictionsPanel } from '../predictions/PredictionsPanel';
import { ScoringCriteriaPanel } from '../scoring/ScoringCriteriaPanel';
import { fetchPrizes, type PrizeRow } from '../../services/prize-service';
import type { ClassificationRow } from '../../types/classification';
import { normalizeParticipantName } from '../../utils/participants';

type LeaderboardPageProps = {
  rows: ClassificationRow[];
  isLoading: boolean;
  error: string | null;
  currentParticipant: string;
};

export function LeaderboardPage({
  rows,
  isLoading,
  error,
  currentParticipant,
}: LeaderboardPageProps) {
  const location = useLocation();
  const [prizes, setPrizes] = useState<PrizeRow[]>([]);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizesError, setPrizesError] = useState<string | null>(null);
  const leader = rows[0];
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantRow = rows.find(
    (row) => normalizeParticipantName(row.participante) === normalizedCurrentParticipant,
  );

  useEffect(() => {
    if (location.pathname === '/premios' && prizes.length === 0 && !isLoadingPrizes) {
      void loadPrizes();
    }
  }, [location.pathname]);

  async function loadPrizes() {
    setIsLoadingPrizes(true);
    setPrizesError(null);

    try {
      const loadedPrizes = await fetchPrizes();
      setPrizes(loadedPrizes);
    } catch (error) {
      setPrizesError(
        error instanceof Error ? error.message : 'No se pudieron cargar los premios.',
      );
    } finally {
      setIsLoadingPrizes(false);
    }
  }

  function renderClassificationRoute() {
    return (
      <>
        {isLoading ? <div className="status-card">Cargando clasificación...</div> : null}
        {error ? <div className="status-card status-card-error">{error}</div> : null}
        {!isLoading && !error ? (
          <LeaderboardTable rows={rows} currentParticipant={currentParticipant} />
        ) : null}
      </>
    );
  }

  return (
    <section className="leaderboard-panel">
      <div className="summary-grid">
        <article className="summary-card highlight-card">
          <span className="summary-label">Líder actual</span>
          <strong>{leader ? leader.participante : 'Sin datos'}</strong>
          <span>{leader ? `${leader.total} puntos` : 'Esperando clasificación'}</span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Jugadores</span>
          <strong>{rows.length}</strong>
          <span>Participantes registrados</span>
        </article>
        <article className="summary-card current-user-card">
          <span className="summary-label">Tu posición</span>
          <strong>{currentParticipantRow ? `#${currentParticipantRow.posicion}` : 'Sin datos'}</strong>
          <span>
            {currentParticipantRow
              ? `${currentParticipantRow.total} puntos`
              : 'No aparece en la clasificación actual'}
          </span>
        </article>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/clasificacion" replace />} />
        <Route path="/clasificacion" element={renderClassificationRoute()} />
        <Route
          path="/pronostico"
          element={
            <PredictionsPanel
              classificationRows={rows}
              currentParticipant={currentParticipant}
            />
          }
        />
        <Route
          path="/premios"
          element={
            <PrizesPanel
              currentPosition={currentParticipantRow?.posicion ?? null}
              error={prizesError}
              isLoading={isLoadingPrizes}
              prizes={prizes}
            />
          }
        />
        <Route path="/puntuacion" element={<ScoringCriteriaPanel />} />
        <Route path="*" element={<Navigate to="/clasificacion" replace />} />
      </Routes>
    </section>
  );
}
