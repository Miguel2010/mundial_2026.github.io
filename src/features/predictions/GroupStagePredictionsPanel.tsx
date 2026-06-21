import { useState } from 'react';
import type { GroupStageMatch } from '../../types/predictions';
import { PredictionMatchesPanel } from './PredictionMatchesPanel';
import { getPredictionOutcomeSummary } from './prediction-outcomes';

type GroupStageView = 'pending' | 'played';

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
  const pendingMatches = matches.filter((match) => !match.played);
  const playedMatches = matches.filter((match) => match.played).slice().reverse();
  const visibleMatches = activeView === 'pending' ? pendingMatches : playedMatches;
  const predictionOutcomeSummary = getPredictionOutcomeSummary(matches, currentParticipant);

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
      </div>

      {!isLoading && !error ? (
        <>
          <div className="group-stage-view-tabs" role="tablist" aria-label="Vista de fase de grupos">
            <button
              className={`group-stage-view-tab${activeView === 'pending' ? ' group-stage-view-tab-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeView === 'pending'}
              onClick={() => setActiveView('pending')}
            >
              Pendientes ({pendingMatches.length})
            </button>
            <button
              className={`group-stage-view-tab${activeView === 'played' ? ' group-stage-view-tab-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeView === 'played'}
              onClick={() => setActiveView('played')}
            >
              Jugados ({playedMatches.length})
            </button>
          </div>
        </>
      ) : null}

      <PredictionMatchesPanel
        currentParticipant={currentParticipant}
        emptyMessage={
          activeView === 'pending'
            ? 'No hay partidos pendientes en esta vista.'
            : 'No hay partidos jugados en esta vista.'
        }
        error={error}
        isLoading={isLoading}
        matches={visibleMatches}
        showHeading={false}
        title="Fase de Grupos"
      />
    </div>
  );
}
