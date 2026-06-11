import type { PrizeRow } from '../../services/prize-service';

type PrizesPanelProps = {
  currentPosition: number | null;
  error: string | null;
  isLoading: boolean;
  prizes: PrizeRow[];
};

function formatPrize(premio: number) {
  return `${premio.toLocaleString('es-ES')} %`;
}

function getPrizePositionLabel(posicion: number) {
  if (posicion === 1) return '🥇 #1';
  if (posicion === 2) return '🥈 #2';
  if (posicion === 3) return '🥉 #3';
  return `🎁 #${posicion}`;
}

function getPrizeRowClassName(posicion: number, currentPosition: number | null) {
  const currentPositionClassName = posicion === currentPosition ? ' prize-row-current-user' : '';

  if (posicion === 1) return `prize-row prize-row-gold${currentPositionClassName}`;
  if (posicion === 2) return `prize-row prize-row-silver${currentPositionClassName}`;
  if (posicion === 3) return `prize-row prize-row-bronze${currentPositionClassName}`;
  return `prize-row prize-row-top10${currentPositionClassName}`;
}

export function PrizesPanel({ currentPosition, error, isLoading, prizes }: PrizesPanelProps) {
  const currentPrize = prizes.find((prize) => prize.posicion === currentPosition)?.premio ?? 0;
  const hasCurrentPrize = currentPrize > 0;

  if (isLoading) {
    return <div className="status-card">Cargando premios...</div>;
  }

  if (error) {
    return <div className="status-card status-card-error">{error}</div>;
  }

  return (
    <div className="prizes-panel">
      <article className="current-prize-card">
        <span className="summary-label">Tu premio actual</span>
        <strong>{formatPrize(currentPrize)}</strong>
        <span>
          {hasCurrentPrize
            ? `Según tu posición actual: #${currentPosition}`
            : 'Ahora mismo estás fuera de los puestos con premio.'}
        </span>
      </article>

      <div className="prize-table-card">
        <table className="prize-table">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Premio</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize) => (
              <tr
                key={prize.posicion}
                className={getPrizeRowClassName(prize.posicion, currentPosition)}
              >
                <td className="prize-position">{getPrizePositionLabel(prize.posicion)}</td>
                <td>
                  <strong>{formatPrize(prize.premio)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
