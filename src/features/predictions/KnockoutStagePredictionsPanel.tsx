import type { ParticipantPredictions } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';
import { getTeamFlag } from '../../utils/teamFlags';

type KnockoutStagePredictionsPanelProps = {
  currentParticipant: string;
  error: string | null;
  isLoading: boolean;
  participants: ParticipantPredictions[];
  title: string;
};

function getDisplayMatchLabel(matchLabel: string) {
  return matchLabel === '-' ? 'Sin definir' : matchLabel;
}

function MatchLabel({ matchLabel }: { matchLabel: string }) {
  const displayMatchLabel = getDisplayMatchLabel(matchLabel);
  const [homeTeam, awayTeam, ...rest] = displayMatchLabel.split('-');

  if (!homeTeam || !awayTeam || rest.length > 0) {
    return <span>{displayMatchLabel}</span>;
  }

  const trimmedHomeTeam = homeTeam.trim();
  const trimmedAwayTeam = awayTeam.trim();

  return (
    <span className="prediction-teams prediction-teams-inline">
      <span className="prediction-team">
        <span className="team-flag" aria-hidden="true">{getTeamFlag(trimmedHomeTeam)}</span>
        <span>{trimmedHomeTeam}</span>
      </span>
      <span className="prediction-versus">vs</span>
      <span className="prediction-team">
        <span className="team-flag" aria-hidden="true">{getTeamFlag(trimmedAwayTeam)}</span>
        <span>{trimmedAwayTeam}</span>
      </span>
    </span>
  );
}

function getOrderedParticipants(
  participants: ParticipantPredictions[],
  currentParticipant: string,
) {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantPredictions = participants.find(
    (participant) =>
      normalizeParticipantName(participant.participante) === normalizedCurrentParticipant,
  );

  if (!currentParticipantPredictions) {
    return participants;
  }

  return [
    currentParticipantPredictions,
    ...participants.filter(
      (participant) =>
        normalizeParticipantName(participant.participante) !== normalizedCurrentParticipant,
    ),
  ];
}

export function KnockoutStagePredictionsPanel({
  currentParticipant,
  error,
  isLoading,
  participants,
  title,
}: KnockoutStagePredictionsPanelProps) {
  const orderedParticipants = getOrderedParticipants(participants, currentParticipant);

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
          {orderedParticipants.length} participantes con sus cruces y marcadores pronosticados.
        </p>
      </div>

      <div className="prediction-match-list">
        {orderedParticipants.map((participant, index) => (
          <details className="prediction-match-card" key={participant.participante} open={index === 0}>
            <summary className="prediction-match-summary">
              <span className="prediction-teams">
                <span>{participant.participante}</span>
              </span>
              <span className="prediction-count">{participant.predictions.length} cruces</span>
            </summary>

            <div className="prediction-table-card">
              <table className="prediction-table">
                <thead>
                  <tr>
                    <th>Partido</th>
                    <th>Marcador</th>
                  </tr>
                </thead>
                <tbody>
                  {participant.predictions.map((prediction) => (
                    <tr key={`${participant.participante}-${prediction.matchId}`}>
                      <td>
                        <MatchLabel matchLabel={prediction.matchLabel} />
                      </td>
                      <td>
                        <strong>{prediction.score}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
