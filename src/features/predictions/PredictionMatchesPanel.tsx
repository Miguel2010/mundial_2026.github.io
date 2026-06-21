import type { PredictionMatch } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';
import {
  getPredictionOutcome,
  getPredictionOutcomeLabel,
  type PredictionOutcome,
} from './prediction-outcomes';

type Prediction = PredictionMatch['predictions'][number];

type PredictionMatchesPanelProps = {
  currentParticipant: string;
  emptyMessage?: string;
  error: string | null;
  isLoading: boolean;
  matches: PredictionMatch[];
  showHeading?: boolean;
  title: string;
};

function getPredictionRowClassName(participante: string, currentParticipant: string) {
  const isCurrentParticipant =
    normalizeParticipantName(participante) === normalizeParticipantName(currentParticipant);

  return isCurrentParticipant ? 'prediction-row prediction-row-current-user' : 'prediction-row';
}

function getOrderedPredictions(match: PredictionMatch, currentParticipant: string) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantPrediction = match.predictions.find(
    (prediction) =>
      normalizeParticipantName(prediction.participante) === normalizedCurrentParticipant,
  );
  const remainingPredictions = match.predictions.filter(
    (prediction) =>
      normalizeParticipantName(prediction.participante) !== normalizedCurrentParticipant,
  );

  if (!currentParticipantPrediction) {
    return match.predictions;
  }

  if (!match.played || !match.result) {
    return [currentParticipantPrediction, ...remainingPredictions];
  }

  const groupedPredictions = remainingPredictions.reduce(
    (groups, prediction) => {
      const outcome = getPredictionOutcome(prediction.score, match.result);

      if (outcome === 'exact') {
        groups.exact.push(prediction);
        return groups;
      }

      if (outcome === 'partial') {
        groups.partial.push(prediction);
        return groups;
      }

      if (outcome === 'incorrect') {
        groups.incorrect.push(prediction);
        return groups;
      }

      groups.unknown.push(prediction);
      return groups;
    },
    {
      exact: [] as Prediction[],
      partial: [] as Prediction[],
      incorrect: [] as Prediction[],
      unknown: [] as Prediction[],
    },
  );

  return [
    currentParticipantPrediction,
    ...groupedPredictions.exact,
    ...groupedPredictions.partial,
    ...groupedPredictions.incorrect,
    ...groupedPredictions.unknown,
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

export function PredictionMatchesPanel({
  currentParticipant,
  emptyMessage = 'No hay partidos para mostrar en esta vista.',
  error,
  isLoading,
  matches,
  showHeading = true,
  title,
}: PredictionMatchesPanelProps) {
  const participantCount = matches[0]?.predictions.length ?? 0;

  if (isLoading) {
    return <div className="status-card">Cargando pronósticos...</div>;
  }

  if (error) {
    return <div className="status-card status-card-error">{error}</div>;
  }

  if (matches.length === 0) {
    return <div className="status-card">{emptyMessage}</div>;
  }

  return (
    <div className="predictions-panel">
      {showHeading ? (
        <div className="section-heading predictions-heading">
          <span className="section-kicker">Pronóstico</span>
          <h3>{title}</h3>
          <p>
            {matches.length} partidos y {participantCount} participantes con pronóstico registrado.
          </p>
        </div>
      ) : null}

      <div className="prediction-match-list">
        {matches.map((match) => {
          const orderedPredictions = getOrderedPredictions(match, currentParticipant);
          const cardClassName = match.played
            ? 'prediction-match-card prediction-match-card-played'
            : 'prediction-match-card';

          return (
            <details className={cardClassName} key={match.id}>
              <summary className="prediction-match-summary">
                <span className="prediction-summary-content">
                  <span className="prediction-teams">
                    <TeamName flag={match.homeFlag} name={match.homeTeam} />
                    <span className="prediction-versus">vs</span>
                    <TeamName flag={match.awayFlag} name={match.awayTeam} />
                  </span>
                  <span className="prediction-summary-meta">
                    {match.played ? <span className="prediction-status-badge">Jugado</span> : null}
                    {match.played && match.result ? (
                      <span className="prediction-match-result">
                        Resultado <strong>{match.result}</strong>
                      </span>
                    ) : null}
                    <span className="prediction-count">{match.predictions.length} pronósticos</span>
                  </span>
                </span>
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
                      (() => {
                        const predictionOutcome = match.played
                          ? getPredictionOutcome(prediction.score, match.result)
                          : null;

                        return (
                          <tr
                            className={getPredictionRowClassName(
                              prediction.participante,
                              currentParticipant,
                            )}
                            key={`${match.id}-${prediction.participante}-${index}`}
                          >
                            <td className="player-name">{prediction.participante}</td>
                            <td className="prediction-score-cell">
                              <span className="prediction-score-label">Pronóstico</span>
                              <span className="prediction-score-value">
                                <strong>{prediction.score}</strong>
                                {predictionOutcome ? (
                                  <span
                                    className={`prediction-outcome-badge prediction-outcome-badge-${predictionOutcome}`}
                                  >
                                    {getPredictionOutcomeLabel(predictionOutcome)}
                                  </span>
                                ) : null}
                              </span>
                            </td>
                          </tr>
                        );
                      })()
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
