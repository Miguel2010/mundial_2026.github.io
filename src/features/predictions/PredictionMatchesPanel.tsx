import type { PredictionMatch } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';

type Prediction = PredictionMatch['predictions'][number];

type PredictionMatchesPanelProps = {
  currentParticipant: string;
  error: string | null;
  isLoading: boolean;
  matches: PredictionMatch[];
  showOutcomeLegend?: boolean;
  title: string;
};

type PredictionOutcome = 'exact' | 'partial' | 'incorrect';
type PredictionOutcomeSummary = Record<'played' | PredictionOutcome, number>;

function parseScore(score: string) {
  const match = score.trim().match(/^(\d+)-(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    home: Number.parseInt(match[1], 10),
    away: Number.parseInt(match[2], 10),
  };
}

function getScoreOutcome(score: { home: number; away: number }) {
  if (score.home === score.away) {
    return 'draw';
  }

  return score.home > score.away ? 'home' : 'away';
}

function getPredictionOutcome(predictedScore: string, finalResult?: string): PredictionOutcome | null {
  if (!finalResult) {
    return null;
  }

  const parsedPrediction = parseScore(predictedScore);
  const parsedResult = parseScore(finalResult);

  if (!parsedPrediction || !parsedResult) {
    return null;
  }

  if (
    parsedPrediction.home === parsedResult.home &&
    parsedPrediction.away === parsedResult.away
  ) {
    return 'exact';
  }

  return getScoreOutcome(parsedPrediction) === getScoreOutcome(parsedResult)
    ? 'partial'
    : 'incorrect';
}

function getPredictionOutcomeLabel(outcome: PredictionOutcome) {
  if (outcome === 'exact') {
    return 'Exacto';
  }

  if (outcome === 'partial') {
    return 'Parcial';
  }

  return 'Incorrecto';
}

function getPredictionOutcomeSummary(
  matches: PredictionMatch[],
  normalizedCurrentParticipant: string,
): PredictionOutcomeSummary {
  return matches.reduce<PredictionOutcomeSummary>(
    (summary, match) => {
      if (!match.played || !match.result) {
        return summary;
      }

      const currentParticipantPrediction = match.predictions.find(
        (prediction) =>
          normalizeParticipantName(prediction.participante) === normalizedCurrentParticipant,
      );

      if (!currentParticipantPrediction) {
        return summary;
      }

      const outcome = getPredictionOutcome(currentParticipantPrediction.score, match.result);

      if (!outcome) {
        return summary;
      }

      return {
        ...summary,
        played: summary.played + 1,
        [outcome]: summary[outcome] + 1,
      };
    },
    {
      played: 0,
      exact: 0,
      partial: 0,
      incorrect: 0,
    },
  );
}

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

export function PredictionMatchesPanel({
  currentParticipant,
  error,
  isLoading,
  matches,
  showOutcomeLegend = false,
  title,
}: PredictionMatchesPanelProps) {
  const participantCount = matches[0]?.predictions.length ?? 0;
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const predictionOutcomeSummary = showOutcomeLegend
    ? getPredictionOutcomeSummary(matches, normalizedCurrentParticipant)
    : null;

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
        <h3>{title}</h3>
        <p>
          {matches.length} partidos y {participantCount} participantes con pronóstico registrado.
        </p>
        {predictionOutcomeSummary ? (
          <div className="prediction-outcome-summary" aria-label="Resumen de aciertos personales">
            <article className="prediction-outcome-stat prediction-outcome-stat-played">
              <strong>{predictionOutcomeSummary.played}</strong>
              <span>Jugados</span>
            </article>
            <article className="prediction-outcome-stat prediction-outcome-stat-exact">
              <strong>{predictionOutcomeSummary.exact}</strong>
              <span>Exactos</span>
            </article>
            <article className="prediction-outcome-stat prediction-outcome-stat-partial">
              <strong>{predictionOutcomeSummary.partial}</strong>
              <span>Parciales</span>
            </article>
            <article className="prediction-outcome-stat prediction-outcome-stat-incorrect">
              <strong>{predictionOutcomeSummary.incorrect}</strong>
              <span>Incorrectos</span>
            </article>
          </div>
        ) : null}
        {showOutcomeLegend ? (
          <div className="prediction-outcome-legend" aria-label="Leyenda de resultados">
            <span className="prediction-outcome-legend-item">
              <span className="prediction-outcome-badge prediction-outcome-badge-exact">Exacto</span>
              marcador exacto
            </span>
            <span className="prediction-outcome-legend-item">
              <span className="prediction-outcome-badge prediction-outcome-badge-partial">Parcial</span>
              acertaste ganador o empate
            </span>
            <span className="prediction-outcome-legend-item">
              <span className="prediction-outcome-badge prediction-outcome-badge-incorrect">Incorrecto</span>
              pronóstico incorrecto
            </span>
          </div>
        ) : null}
      </div>

      <div className="prediction-match-list">
        {matches.map((match) => {
          const orderedPredictions = getOrderedPredictions(match.predictions, currentParticipant);
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
