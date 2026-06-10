import { useState } from 'react';
import { LeaderboardTable } from './LeaderboardTable';
import { PrizesPanel } from '../prizes/PrizesPanel';
import { fetchPrizes, type PrizeRow } from '../../services/prize-service';
import type { ClassificationRow } from '../../types/classification';
import { normalizeParticipantName } from '../../utils/participants';

type LeaderboardTab = 'classification' | 'prizes';

type LeaderboardPageProps = {
  rows: ClassificationRow[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  currentParticipant: string;
  onLogout: () => void;
};

export function LeaderboardPage({
  rows,
  isLoading,
  error,
  lastUpdated,
  currentParticipant,
  onLogout,
}: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('classification');
  const [prizes, setPrizes] = useState<PrizeRow[]>([]);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizesError, setPrizesError] = useState<string | null>(null);
  const leader = rows[0];
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantRow = rows.find(
    (row) => normalizeParticipantName(row.participante) === normalizedCurrentParticipant,
  );

  async function handleSelectTab(tab: LeaderboardTab) {
    setActiveTab(tab);

    if (tab !== 'prizes' || prizes.length > 0 || isLoadingPrizes) {
      return;
    }

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

  return (
    <section className="leaderboard-panel">
      <div className="section-heading section-heading-inline">
        <div>
          <span className="section-kicker">Clasificación</span>
          <h2>Tabla general</h2>
          <p>
            {lastUpdated ?? 'La fecha de actualización se mostrará cuando esté disponible.'}
          </p>
        </div>
        <div className="section-actions">
          <span className="session-label">Conectado como {currentParticipant}</span>
          <button className="ghost-button" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

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

      <div className="tabs" role="tablist" aria-label="Secciones de la clasificación">
        <button
          className={`tab-button${activeTab === 'classification' ? ' tab-button-active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'classification'}
          onClick={() => void handleSelectTab('classification')}
        >
          Clasificación
        </button>
        <button
          className={`tab-button${activeTab === 'prizes' ? ' tab-button-active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'prizes'}
          onClick={() => void handleSelectTab('prizes')}
        >
          Premios
        </button>
      </div>

      {activeTab === 'classification' ? (
        <>
          {isLoading ? <div className="status-card">Cargando clasificación...</div> : null}
          {error ? <div className="status-card status-card-error">{error}</div> : null}
          {!isLoading && !error ? (
            <LeaderboardTable rows={rows} currentParticipant={currentParticipant} />
          ) : null}
        </>
      ) : (
        <PrizesPanel
          currentPosition={currentParticipantRow?.posicion ?? null}
          error={prizesError}
          isLoading={isLoadingPrizes}
          prizes={prizes}
        />
      )}
    </section>
  );
}
