import { LeaderboardTable } from './LeaderboardTable';
import type { ClassificationRow } from '../../types/classification';
import { normalizeParticipantName } from '../../utils/participants';

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
  const leader = rows[0];
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantRow = rows.find(
    (row) => normalizeParticipantName(row.participante) === normalizedCurrentParticipant,
  );

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

      {isLoading ? <div className="status-card">Cargando clasificación...</div> : null}
      {error ? <div className="status-card status-card-error">{error}</div> : null}
      {!isLoading && !error ? (
        <LeaderboardTable rows={rows} currentParticipant={currentParticipant} />
      ) : null}
    </section>
  );
}
