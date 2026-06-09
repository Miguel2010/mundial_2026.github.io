import type { ClassificationRow } from '../../types/classification';

type LeaderboardTableProps = {
  rows: ClassificationRow[];
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

function getRowClassName(index: number) {
  if (index === 0) return 'rank-row rank-row-gold';
  if (index === 1) return 'rank-row rank-row-silver';
  if (index === 2) return 'rank-row rank-row-bronze';
  if (index < 10) return 'rank-row rank-row-top10';
  return 'rank-row';
}

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
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
            {rows.map((row, index) => (
              <tr key={`${row.participante}-${index}`} className={getRowClassName(index)}>
                <td>{index + 1}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
