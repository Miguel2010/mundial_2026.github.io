import { useState } from 'react';
import type { ParticipantGroupHits } from '../../services/selecciones-clasificadas-service';
import type { ParticipantPredictions } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';
import { getTeamFlag } from '../../utils/teamFlags';

const DATA_WARNING_VISIBLE_PARTICIPANTS = ['Mario Pines', 'Juan Navarro', 'Miguel Garcia'];

const dataWarningVisibleParticipants = new Set(
  DATA_WARNING_VISIBLE_PARTICIPANTS.map((participant) => normalizeParticipantName(participant)),
);

type KnockoutStagePredictionsPanelProps = {
  currentParticipant: string;
  error: string | null;
  goalsData: { predicted: number; actual: number } | null;
  groupHits: ParticipantGroupHits | null;
  isLoading: boolean;
  participants: ParticipantPredictions[];
  title: string;
  warnings: string[];
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

function GroupHitsCard({
  label,
  correctList,
  className,
  isExpanded,
  onToggle,
}: {
  label: string;
  correctList: Array<{ grupo: string; team: string }>;
  className: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasHits = correctList.length > 0;

  return (
    <details className={`prediction-group-hits-card ${className}`} open={isExpanded}>
      <summary
        className="prediction-group-hits-summary"
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <span className="prediction-group-hits-label">{label}</span>
        <span className="prediction-group-hits-count">{correctList.length}</span>
        <span className="prediction-group-hits-arrow">{isExpanded ? '▲' : '▼'}</span>
      </summary>
      {hasHits ? (
        <ul className="prediction-group-hits-list">
          {correctList.map((item) => (
            <li key={item.grupo}>
              <span className="team-flag" aria-hidden="true">{getTeamFlag(item.team)}</span>
              <strong>Grupo {item.grupo}:</strong> {item.team}
            </li>
          ))}
        </ul>
      ) : (
        <div className="prediction-group-hits-empty">Sin aciertos</div>
      )}
    </details>
  );
}

export function KnockoutStagePredictionsPanel({
  currentParticipant,
  error,
  goalsData,
  groupHits,
  isLoading,
  participants,
  title,
  warnings,
}: KnockoutStagePredictionsPanelProps) {
  const [expandedCard, setExpandedCard] = useState<'primera' | 'segunda' | 'tercera' | null>(null);
  const orderedParticipants = getOrderedParticipants(participants, currentParticipant);
  const shouldShowWarnings = dataWarningVisibleParticipants.has(
    normalizeParticipantName(currentParticipant),
  );

  if (isLoading) {
    return <div className="status-card">Cargando pronósticos...</div>;
  }

  if (error) {
    return <div className="status-card status-card-error">{error}</div>;
  }

  return (
    <div className="predictions-panel">
      {shouldShowWarnings && warnings.length > 0 ? (
        <details className="status-card status-card-warning prediction-warning-panel">
          <summary className="prediction-warning-summary">
            <strong>Revisar datos del CSV</strong>
            <span className="prediction-warning-summary-trailing">
              <span className="prediction-warning-count">{warnings.length}</span>
            </span>
          </summary>
          <ul className="prediction-warning-list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {goalsData ? (
        <div className="prediction-outcome-summary prediction-goals-summary">
          <div className="prediction-outcome-stat prediction-outcome-stat-played prediction-outcome-stat-active">
            <strong>{goalsData.predicted}</strong>
            <span>Goles pronosticados</span>
          </div>
          <div className="prediction-outcome-stat prediction-outcome-stat-played">
            <strong>{goalsData.actual}</strong>
            <span>Goles reales</span>
          </div>
        </div>
      ) : null}

      {groupHits ? (
        <div className="prediction-group-hits-cols">
          <GroupHitsCard
            label="Primeras acertadas"
            correctList={groupHits.primerasList}
            className="prediction-group-hits-card-exact"
            isExpanded={expandedCard === 'primera'}
            onToggle={() => setExpandedCard(expandedCard === 'primera' ? null : 'primera')}
          />
          <GroupHitsCard
            label="Segundas acertadas"
            correctList={groupHits.segundasList}
            className="prediction-group-hits-card-partial"
            isExpanded={expandedCard === 'segunda'}
            onToggle={() => setExpandedCard(expandedCard === 'segunda' ? null : 'segunda')}
          />
          <GroupHitsCard
            label="Terceras acertadas"
            correctList={groupHits.tercerasList}
            className="prediction-group-hits-card-incorrect"
            isExpanded={expandedCard === 'tercera'}
            onToggle={() => setExpandedCard(expandedCard === 'tercera' ? null : 'tercera')}
          />
        </div>
      ) : null}

      <div className="prediction-match-list">
        {orderedParticipants.map((participant, index) => (
          <details className="prediction-match-card" key={participant.participante} open={index === 0}>
            <summary className="prediction-match-summary">
              <span className="prediction-teams">
                <span>{participant.participante}</span>
              </span>
              <span className="prediction-summary-trailing">
                <span className="prediction-count">{participant.predictions.length} cruces</span>
              </span>
            </summary>

            <div className="prediction-table-card">
              <table className="prediction-table">
                <thead>
                  <tr>
                    <th>Partido</th>
                    <th className="prediction-knockout-score-header">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                    {participant.predictions.map((prediction) => (
                      <tr key={`${participant.participante}-${prediction.matchId}`}>
                      <td className="prediction-knockout-match-cell">
                        <div className="prediction-knockout-match-content">
                          <MatchLabel matchLabel={prediction.matchLabel} />
                          {prediction.penaltyWinner ? (
                            <span className="prediction-penalty-badge">
                              Pen: {prediction.penaltyWinner}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="prediction-score-cell prediction-knockout-score">
                        <span className="prediction-score-label">Resultado</span>
                        <div className="prediction-knockout-score-value">
                          <strong>{prediction.score}</strong>
                        </div>
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
