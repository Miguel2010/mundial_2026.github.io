import { useState } from 'react';
import type { GroupStageMatch } from '../../types/predictions';
import { PredictionMatchesPanel } from './PredictionMatchesPanel';
import {
  getCurrentParticipantOutcome,
  getPredictionOutcomeSummary,
  type PredictionOutcome,
} from './prediction-outcomes';

type GroupStageView = 'pending' | 'played';
type GroupStageOutcomeFilter = 'all' | PredictionOutcome;

type GroupStagePredictionsPanelProps = {
  currentParticipant: string;
  error: string | null;
  isLoading: boolean;
  matches: GroupStageMatch[];
};

export function GroupStagePredictionsPanel({
  currentParticipant,
  error,
  isLoading,
  matches,
}: GroupStagePredictionsPanelProps) {
  const [activeView, setActiveView] = useState<GroupStageView>('pending');
  const [activeOutcomeFilter, setActiveOutcomeFilter] = useState<GroupStageOutcomeFilter>('all');
  const pendingMatches = matches.filter((match) => !match.played);
  const playedMatches = matches.filter((match) => match.played).slice().reverse();
  const predictionOutcomeSummary = getPredictionOutcomeSummary(matches, currentParticipant);
  const filteredPlayedMatches =
    activeOutcomeFilter === 'all'
      ? playedMatches
      : playedMatches.filter(
          (match) => getCurrentParticipantOutcome(match, currentParticipant) === activeOutcomeFilter,
        );
  const visibleMatches = activeView === 'pending' ? pendingMatches : filteredPlayedMatches;

  function handleSelectPendingView() {
    setActiveView('pending');
    setActiveOutcomeFilter('all');
  }

  function handleSelectPlayedView() {
    setActiveView('played');
    setActiveOutcomeFilter('all');
  }

  function handleToggleOutcomeFilter(outcome: PredictionOutcome) {
    setActiveView('played');
    setActiveOutcomeFilter((currentFilter) => (currentFilter === outcome ? 'all' : outcome));
  }

  const emptyMessage =
    activeView === 'pending'
      ? 'No hay partidos pendientes en esta vista.'
      : activeOutcomeFilter === 'exact'
        ? 'No hay partidos jugados con resultado exacto en esta vista.'
        : activeOutcomeFilter === 'partial'
          ? 'No hay partidos jugados con acierto parcial en esta vista.'
          : activeOutcomeFilter === 'incorrect'
            ? 'No hay partidos jugados con pronóstico incorrecto en esta vista.'
            : 'No hay partidos jugados en esta vista.';

  return (
    <div className="predictions-panel">
      <div className="section-heading predictions-heading">
        <span className="section-kicker">Pronóstico</span>
        <h3>Fase de Grupos</h3>
        <p>
          {matches.length} partidos y {matches[0]?.predictions.length ?? 0} participantes con
          pronóstico registrado.
        </p>
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
        <div className="prediction-outcome-summary" aria-label="Resumen de aciertos personales">
          <button
            className={`prediction-outcome-stat prediction-outcome-stat-played${
              activeView === 'played' && activeOutcomeFilter === 'all'
                ? ' prediction-outcome-stat-active'
                : ''
            }`}
            type="button"
            onClick={handleSelectPlayedView}
          >
            <strong>{predictionOutcomeSummary.played}</strong>
            <span>Jugados</span>
          </button>
          <button
            className={`prediction-outcome-stat prediction-outcome-stat-exact${
              activeView === 'played' && activeOutcomeFilter === 'exact'
                ? ' prediction-outcome-stat-active'
                : ''
            }`}
            type="button"
            aria-pressed={activeView === 'played' && activeOutcomeFilter === 'exact'}
            onClick={() => handleToggleOutcomeFilter('exact')}
          >
            <strong>{predictionOutcomeSummary.exact}</strong>
            <span>Exactos</span>
          </button>
          <button
            className={`prediction-outcome-stat prediction-outcome-stat-partial${
              activeView === 'played' && activeOutcomeFilter === 'partial'
                ? ' prediction-outcome-stat-active'
                : ''
            }`}
            type="button"
            aria-pressed={activeView === 'played' && activeOutcomeFilter === 'partial'}
            onClick={() => handleToggleOutcomeFilter('partial')}
          >
            <strong>{predictionOutcomeSummary.partial}</strong>
            <span>Parciales</span>
          </button>
          <button
            className={`prediction-outcome-stat prediction-outcome-stat-incorrect${
              activeView === 'played' && activeOutcomeFilter === 'incorrect'
                ? ' prediction-outcome-stat-active'
                : ''
            }`}
            type="button"
            aria-pressed={activeView === 'played' && activeOutcomeFilter === 'incorrect'}
            onClick={() => handleToggleOutcomeFilter('incorrect')}
          >
            <strong>{predictionOutcomeSummary.incorrect}</strong>
            <span>Incorrectos</span>
          </button>
        </div>
      </div>

      {!isLoading && !error ? (
        <>
          <div className="group-stage-view-tabs" role="tablist" aria-label="Vista de fase de grupos">
            <button
              className={`group-stage-view-tab${activeView === 'pending' ? ' group-stage-view-tab-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeView === 'pending'}
              onClick={handleSelectPendingView}
            >
              Pendientes ({pendingMatches.length})
            </button>
            <button
              className={`group-stage-view-tab${activeView === 'played' ? ' group-stage-view-tab-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeView === 'played'}
              onClick={handleSelectPlayedView}
            >
              Jugados ({playedMatches.length})
            </button>
          </div>
        </>
      ) : null}

      <PredictionMatchesPanel
        currentParticipant={currentParticipant}
        emptyMessage={emptyMessage}
        error={error}
        isLoading={isLoading}
        matches={visibleMatches}
        showHeading={false}
        title="Fase de Grupos"
      />
    </div>
  );
}
