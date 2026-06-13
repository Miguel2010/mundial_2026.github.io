import { useEffect, useRef, useState } from 'react';
import { fetchGroupStagePredictions } from '../../services/group-stage-predictions-service';
import type { GroupStageMatch } from '../../types/predictions';
import { GroupStagePredictionsPanel } from './GroupStagePredictionsPanel';

type PredictionsPanelProps = {
  currentParticipant: string;
};

type PredictionSection = 'group-stage';

const predictionSections: Array<{ id: PredictionSection; label: string }> = [
  { id: 'group-stage', label: 'Fase de Grupos' },
];

export function PredictionsPanel({ currentParticipant }: PredictionsPanelProps) {
  const [activeSection, setActiveSection] = useState<PredictionSection>('group-stage');
  const [groupStageMatches, setGroupStageMatches] = useState<GroupStageMatch[]>([]);
  const [isLoadingGroupStage, setIsLoadingGroupStage] = useState(false);
  const [groupStageError, setGroupStageError] = useState<string | null>(null);
  const hasRequestedGroupStageRef = useRef(false);

  useEffect(() => {
    if (activeSection === 'group-stage' && !hasRequestedGroupStageRef.current) {
      hasRequestedGroupStageRef.current = true;
      void loadGroupStagePredictions();
    }
  }, [activeSection]);

  async function loadGroupStagePredictions() {
    setIsLoadingGroupStage(true);
    setGroupStageError(null);

    try {
      const loadedMatches = await fetchGroupStagePredictions();
      setGroupStageMatches(loadedMatches);
    } catch (error) {
      setGroupStageError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingGroupStage(false);
    }
  }

  return (
    <div className="predictions-shell">
      <div className="prediction-section-tabs" role="tablist" aria-label="Secciones del pronóstico">
        {predictionSections.map((section) => (
          <button
            className={`prediction-section-tab${
              activeSection === section.id ? ' prediction-section-tab-active' : ''
            }`}
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'group-stage' ? (
        <GroupStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={groupStageError}
          isLoading={isLoadingGroupStage}
          matches={groupStageMatches}
        />
      ) : null}
    </div>
  );
}
