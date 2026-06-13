import type { GroupStageMatch } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';

type Prediction = GroupStageMatch['predictions'][number];

type GroupStagePredictionsPanelProps = {
  currentParticipant: string;
  error: string | null;
  isLoading: boolean;
  matches: GroupStageMatch[];
};

function getPredictionRowClassName(participante: string, currentParticipant: string) {
  const isCurrentParticipant =
    normalizeParticipantName(participante) === normalizeParticipantName(currentParticipant);

  return isCurrentParticipant ? 'prediction-row prediction-row-current-user' : 'prediction-row';
}

function getOrderedPredictions(predictions: Prediction[], currentParticipant: string) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantPrediction = predictions.find(
    (prediction) =>
      normalizeParticipantName(prediction.participante) === normalizedCurrentParticipant,
  );

  if (!currentParticipantPrediction) {
    return predictions;
  }

  return [
    currentParticipantPrediction,
    ...predictions.filter(
      (prediction) =>
        normalizeParticipantName(prediction.participante) !== normalizedCurrentParticipant,
    ),
  ];
}

function TeamName({ flag, name }: { flag: string; name: string }) {
  return (
    <span className="prediction-team">
      {flag ? <span className="team-flag" aria-hidden="true">{flag}</span> : null}
      <span>{name}</span>
    </span>
  );
}

export function GroupStagePredictionsPanel({
  currentParticipant,
  error,
  isLoading,
  matches,
}: GroupStagePredictionsPanelProps) {
  const participantCount = matches[0]?.predictions.length ?? 0;

  if (isLoading) {
    return <div className="status-card">Cargando pronósticos...</div>;
  }

  if (error) {
    return <div className="status-card status-card-error">{error}</div>;
  }

  return (
    <div className="predictions-panel">
      <div className="section-heading predictions-heading">
        <span className="section-kicker">Pronóstico</span>
        <h3>Fase de Grupos</h3>
        <p>
          {matches.length} partidos y {participantCount} participantes con pronóstico registrado.
        </p>
      </div>

      <div className="prediction-match-list">
        {matches.map((match) => {
          const orderedPredictions = getOrderedPredictions(match.predictions, currentParticipant);

          return (
            <details className="prediction-match-card" key={match.id}>
              <summary className="prediction-match-summary">
                <span className="prediction-teams">
                  <TeamName flag={match.homeFlag} name={match.homeTeam} />
                  <span className="prediction-versus">vs</span>
                  <TeamName flag={match.awayFlag} name={match.awayTeam} />
                </span>
                <span className="prediction-count">{match.predictions.length} pronósticos</span>
              </summary>

              <div className="prediction-table-card">
                <table className="prediction-table">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Marcador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedPredictions.map((prediction, index) => (
                      <tr
                        className={getPredictionRowClassName(
                          prediction.participante,
                          currentParticipant,
                        )}
                        key={`${match.id}-${prediction.participante}-${index}`}
                      >
                        <td className="player-name">{prediction.participante}</td>
                        <td>
                          <strong>{prediction.score}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
