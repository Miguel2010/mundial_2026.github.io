import { Alert } from 'antd';
import type { ClassificationRow, PhasePoints } from '../../types/classification';
import { normalizeParticipantName } from '../../utils/participants';

type LeaderboardTableProps = {
  rows: ClassificationRow[];
  currentParticipant: string;
};

type LeaderboardRowProps = {
  currentParticipant: string;
  row: ClassificationRow;
};

const columnLabels = [
  'Posición',
  'Jugador',
  'Fase grupos',
  'Dieciseisavos',
  'Octavos',
  'Cuartos',
  'Semis',
  '3º y 4º',
  'Final',
  'Total',
];

type PhaseKey = keyof Pick<
  ClassificationRow,
  'grupos' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinales' | 'tercerCuarto' | 'final'
>;

const phaseLabels: Array<{ label: string; key: PhaseKey }> = [
  { label: 'Grupos', key: 'grupos' },
  { label: '16avos', key: 'dieciseisavos' },
  { label: 'Octavos', key: 'octavos' },
  { label: 'Cuartos', key: 'cuartos' },
  { label: 'Semis', key: 'semifinales' },
  { label: '3º/4º', key: 'tercerCuarto' },
  { label: 'Final', key: 'final' },
];

function isCurrentParticipantRow(row: ClassificationRow, normalizedCurrentParticipant: string) {
  return normalizeParticipantName(row.participante) === normalizedCurrentParticipant;
}

function getCurrentParticipantRow(rows: ClassificationRow[], currentParticipant: string) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);

  return rows.find((row) => isCurrentParticipantRow(row, normalizedCurrentParticipant));
}

function getRankClassName(posicion: number) {
  if (posicion === 1) return 'rank-row-gold';
  if (posicion === 2) return 'rank-row-silver';
  if (posicion === 3) return 'rank-row-bronze';
  if (posicion <= 10) return 'rank-row-top10';
  return '';
}

function getRowClassName(posicion: number, isCurrentParticipant: boolean) {
  const rankClassName = getRankClassName(posicion);
  const currentParticipantClassName = isCurrentParticipant ? ' rank-row-current-user' : '';

  return `rank-row${rankClassName ? ` ${rankClassName}` : ''}${currentParticipantClassName}`;
}

function getMobileCardClassName(posicion: number, isCurrentParticipant: boolean) {
  const rankClassName = getRankClassName(posicion);
  const currentParticipantClassName = isCurrentParticipant
    ? ' leaderboard-mobile-card-current-user'
    : '';

  return `leaderboard-mobile-card${rankClassName ? ` ${rankClassName}` : ''}${currentParticipantClassName}`;
}

function PhasePointsValue({ points }: { points: PhasePoints }) {
  return (
    <span className="phase-points">
      <span>{points.total}</span>
      {points.classified !== null ? (
        <span className="phase-points-classified">({points.classified})</span>
      ) : null}
    </span>
  );
}

function LeaderboardTableRow({ currentParticipant, row }: LeaderboardRowProps) {
  const isCurrentParticipant = isCurrentParticipantRow(row, currentParticipant);

  return (
    <tr className={getRowClassName(row.posicion, isCurrentParticipant)}>
      <td>{row.posicion}</td>
      <td className="player-name">{row.participante}</td>
      <td><PhasePointsValue points={row.grupos} /></td>
      <td><PhasePointsValue points={row.dieciseisavos} /></td>
      <td><PhasePointsValue points={row.octavos} /></td>
      <td><PhasePointsValue points={row.cuartos} /></td>
      <td><PhasePointsValue points={row.semifinales} /></td>
      <td><PhasePointsValue points={row.tercerCuarto} /></td>
      <td><PhasePointsValue points={row.final} /></td>
      <td>
        <strong>{row.total}</strong>
      </td>
    </tr>
  );
}

function LeaderboardMobileCard({ currentParticipant, row }: LeaderboardRowProps) {
  const isCurrentParticipant = isCurrentParticipantRow(row, currentParticipant);

  return (
    <article className={getMobileCardClassName(row.posicion, isCurrentParticipant)}>
      <div className="leaderboard-mobile-card-header">
        <div>
          <span className="leaderboard-mobile-position">#{row.posicion}</span>
          <h3>{row.participante}</h3>
        </div>
        <div className="leaderboard-mobile-total">
          <strong>{row.total}</strong>
          <span>puntos</span>
        </div>
      </div>

      <div className="leaderboard-phase-grid">
        {phaseLabels.map((phase) => (
          <span className="leaderboard-phase-chip" key={phase.key}>
            <span>{phase.label}</span>
            <strong><PhasePointsValue points={row[phase.key]} /></strong>
          </span>
        ))}
      </div>
    </article>
  );
}

export function LeaderboardTable({ rows, currentParticipant }: LeaderboardTableProps) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantRow = getCurrentParticipantRow(rows, currentParticipant);

  return (
    <>
      <Alert
        className="leaderboard-breakdown-note"
        description="Entre paréntesis se muestran los puntos obtenidos por selecciones clasificadas; fuera de los paréntesis, la suma de esos puntos más los puntos por acertar resultado y goles."
        message="Cómo leer los puntos por fase"
        showIcon
        type="info"
      />

      <div className="table-card">
        <div className="table-scroll">
          <table className="leaderboard-table">
            <thead>
              <tr>
                {columnLabels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentParticipantRow ? (
                <>
                  <LeaderboardTableRow
                    currentParticipant={normalizedCurrentParticipant}
                    row={currentParticipantRow}
                  />
                  <tr className="rank-row-separator" aria-hidden="true">
                    <td colSpan={columnLabels.length}>
                      <span>Clasificación completa</span>
                    </td>
                  </tr>
                </>
              ) : null}

              {rows.map((row) => (
                <LeaderboardTableRow
                  currentParticipant={normalizedCurrentParticipant}
                  key={`${row.participante}-${row.posicion}`}
                  row={row}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="leaderboard-mobile-list" aria-label="Clasificación en formato móvil">
        {currentParticipantRow ? (
          <>
            <LeaderboardMobileCard
              currentParticipant={normalizedCurrentParticipant}
              row={currentParticipantRow}
            />
            <div className="leaderboard-mobile-separator" aria-hidden="true">
              <span>Clasificación completa</span>
            </div>
          </>
        ) : null}

        {rows.map((row) => (
          <LeaderboardMobileCard
            currentParticipant={normalizedCurrentParticipant}
            key={`${row.participante}-${row.posicion}`}
            row={row}
          />
        ))}
      </div>
    </>
  );
}
