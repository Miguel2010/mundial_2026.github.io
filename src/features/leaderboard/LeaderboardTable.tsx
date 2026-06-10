import type { ClassificationRow } from '../../types/classification';
import { normalizeParticipantName } from '../../utils/participants';

type LeaderboardTableProps = {
  rows: ClassificationRow[];
  currentParticipant: string;
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

function getRowClassName(index: number, isCurrentParticipant: boolean) {
  const currentParticipantClassName = isCurrentParticipant ? ' rank-row-current-user' : '';

  if (index === 0) return `rank-row rank-row-gold${currentParticipantClassName}`;
  if (index === 1) return `rank-row rank-row-silver${currentParticipantClassName}`;
  if (index === 2) return `rank-row rank-row-bronze${currentParticipantClassName}`;
  if (index < 10) return `rank-row rank-row-top10${currentParticipantClassName}`;
  return `rank-row${currentParticipantClassName}`;
}

export function LeaderboardTable({ rows, currentParticipant }: LeaderboardTableProps) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);

  return (
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
            {rows.map((row, index) => {
              const isCurrentParticipant =
                normalizeParticipantName(row.participante) === normalizedCurrentParticipant;

              return (
                <tr
                  key={`${row.participante}-${index}`}
                  className={getRowClassName(index, isCurrentParticipant)}
                >
                  {/*<td>{index + 1}</td> para no leer la posición del fichero*/}
                  <td>{row.posicion}</td>
                  <td className="player-name">{row.participante}</td>
                  <td>{row.grupos}</td>
                  <td>{row.dieciseisavos}</td>
                  <td>{row.octavos}</td>
                  <td>{row.cuartos}</td>
                  <td>{row.semifinales}</td>
                  <td>{row.tercerCuarto}</td>
                  <td>{row.final}</td>
                  <td>
                    <strong>{row.total}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
