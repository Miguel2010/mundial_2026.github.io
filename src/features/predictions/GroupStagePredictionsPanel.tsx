import type { GroupStageMatch } from '../../types/predictions';
import { PredictionMatchesPanel } from './PredictionMatchesPanel';

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
  return (
    <PredictionMatchesPanel
      currentParticipant={currentParticipant}
      error={error}
      isLoading={isLoading}
      matches={matches}
      title="Fase de Grupos"
    />
  );
}
