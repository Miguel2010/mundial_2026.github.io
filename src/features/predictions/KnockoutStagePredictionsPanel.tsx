import { useState } from 'react';
import type { ClasificadasHits } from '../../services/clasificadas-eliminatorias-service';
import type { ParticipantGroupHits } from '../../services/selecciones-clasificadas-service';
import type { ParticipantPredictions } from '../../types/predictions';
import {
  normalizeParticipantName,
  orderParticipantsByRanking,
} from '../../utils/participants';
import { getTeamFlag } from '../../utils/teamFlags';

const DATA_WARNING_VISIBLE_PARTICIPANTS = ['Mario Pines', 'Juan Navarro', 'Miguel Garcia'];

const dataWarningVisibleParticipants = new Set(
  DATA_WARNING_VISIBLE_PARTICIPANTS.map((participant) => normalizeParticipantName(participant)),
);

type KnockoutStagePredictionsPanelProps = {
  clasificadasHits: ClasificadasHits | null;
  currentParticipant: string;
  error: string | null;
  goalsData: { predicted: number; actual: number } | null;
  groupHits: ParticipantGroupHits | null;
  isLoading: boolean;
  participantRanking: string[];
  participants: ParticipantPredictions[];
  title: string;
  warnings: string[];
};

type GroupHitKey = 'primera' | 'segunda' | 'tercera';

type GroupHit = {
  grupo: string;
  team: string;
};

type GroupHitCard = {
  key: GroupHitKey;
  label: string;
  shortLabel: string;
  correctList: GroupHit[];
  className: string;
};

const getDisplayMatchLabel = (matchLabel: string) => {
  return matchLabel === '-' ? 'Sin definir' : matchLabel;
};

const MatchLabel = ({ matchLabel }: { matchLabel: string }) => {
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
};

const getOrderedParticipants = (
  participants: ParticipantPredictions[],
  currentParticipant: string,
  participantRanking: string[],
) => {
  return orderParticipantsByRanking(
    participants,
    participantRanking,
    currentParticipant,
    (participant) => participant.participante,
  );
};

const getGroupHitCards = (groupHits: ParticipantGroupHits): GroupHitCard[] => [
  {
    key: 'primera',
    label: 'Primeras acertadas',
    shortLabel: '1ras',
    correctList: groupHits.primerasList,
    className: 'prediction-group-hits-card-first',
  },
  {
    key: 'segunda',
    label: 'Segundas acertadas',
    shortLabel: '2das',
    correctList: groupHits.segundasList,
    className: 'prediction-group-hits-card-second',
  },
  {
    key: 'tercera',
    label: 'Terceras acertadas',
    shortLabel: '3ras',
    correctList: groupHits.tercerasList,
    className: 'prediction-group-hits-card-third',
  },
];

const GroupHitsCardButton = ({
  card,
  isSelected,
  onToggle,
}: {
  card: GroupHitCard;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const selectedClassName = isSelected ? 'prediction-group-hits-card-selected' : '';

  return (
    <button
      type="button"
      className={`prediction-group-hits-card ${card.className} ${selectedClassName}`}
      aria-expanded={isSelected}
      onClick={onToggle}
    >
      <span className="prediction-group-hits-label prediction-group-hits-label-full">
        {card.label}
      </span>
      <span className="prediction-group-hits-label prediction-group-hits-label-short">
        {card.shortLabel}
      </span>
      <span className="prediction-group-hits-count">{card.correctList.length}</span>
      <span className="prediction-group-hits-arrow" aria-hidden="true">
        {isSelected ? '▲' : '▼'}
      </span>
    </button>
  );
};

const GroupHitsDetails = ({ selectedCard }: { selectedCard: GroupHitCard | null }) => {
  if (!selectedCard) {
    return null;
  }

  const hasHits = selectedCard.correctList.length > 0;

  return (
    <div className="prediction-group-hits-details">
      <div className="prediction-group-hits-details-heading">
        <span>{selectedCard.label}</span>
        <strong>{selectedCard.correctList.length}</strong>
      </div>
      {hasHits ? (
        <ul className="prediction-group-hits-list">
          {selectedCard.correctList.map((item) => (
            <li key={item.grupo}>
              <span className="team-flag" aria-hidden="true">{getTeamFlag(item.team)}</span>
              <strong>Grupo {item.grupo}:</strong> {item.team}
            </li>
          ))}
        </ul>
      ) : (
        <div className="prediction-group-hits-empty">Sin aciertos</div>
      )}
    </div>
  );
};

const GroupHitsSummary = ({ groupHits }: { groupHits: ParticipantGroupHits }) => {
  const [selectedCardKey, setSelectedCardKey] = useState<GroupHitKey | null>(null);
  const cards = getGroupHitCards(groupHits);
  const selectedCard = cards.find((card) => card.key === selectedCardKey) ?? null;

  return (
    <div className="prediction-group-hits">
      <div className="prediction-group-hits-cols">
        {cards.map((card) => (
          <GroupHitsCardButton
            key={card.key}
            card={card}
            isSelected={selectedCardKey === card.key}
            onToggle={() => {
              setSelectedCardKey(selectedCardKey === card.key ? null : card.key);
            }}
          />
        ))}
      </div>
      <GroupHitsDetails selectedCard={selectedCard} />
    </div>
  );
};

const ClasificadasHitsSummary = ({ hits, phaseLabel }: { hits: ClasificadasHits; phaseLabel: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullLabel = `Clasificadas a ${phaseLabel.toLowerCase()} acertadas`;
  const shortLabel = phaseLabel.toLowerCase();

  return (
    <div className="prediction-group-hits">
      <button
        type="button"
        className={`prediction-group-hits-card prediction-group-hits-card-fourth${isExpanded ? ' prediction-group-hits-card-selected' : ''}`}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="prediction-group-hits-label prediction-group-hits-label-full">
          {fullLabel}
        </span>
        <span className="prediction-group-hits-label prediction-group-hits-label-short">
          {shortLabel}
        </span>
        <span className="prediction-group-hits-count">{hits.count}</span>
        <span className="prediction-group-hits-arrow" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>
      {isExpanded ? (
        <div className="prediction-group-hits-details">
          <div className="prediction-group-hits-details-heading">
            <span>{fullLabel}</span>
            <strong>{hits.count}</strong>
          </div>
          {hits.teams.length > 0 ? (
            <ul className="prediction-group-hits-list">
              {hits.teams.map((team) => (
                <li key={team}>
                  <span className="team-flag" aria-hidden="true">{getTeamFlag(team)}</span>
                  <strong>{team}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <div className="prediction-group-hits-empty">Sin aciertos</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const KnockoutStagePredictionsPanel = ({
  clasificadasHits,
  currentParticipant,
  error,
  goalsData,
  groupHits,
  isLoading,
  participantRanking,
  participants,
  title,
  warnings,
}: KnockoutStagePredictionsPanelProps) => {
  const orderedParticipants = getOrderedParticipants(
    participants,
    currentParticipant,
    participantRanking,
  );
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

      {groupHits ? <GroupHitsSummary groupHits={groupHits} /> : null}

      {clasificadasHits ? <ClasificadasHitsSummary hits={clasificadasHits} phaseLabel={title} /> : null}

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
};
