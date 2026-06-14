import { useEffect, useRef, useState } from 'react';
import { fetchCuartosPredictions } from '../../services/cuartos-predictions-service';
import { fetchFinalPredictions } from '../../services/final-predictions-service';
import { fetchGroupStagePredictions } from '../../services/group-stage-predictions-service';
import { fetchOctavosPredictions } from '../../services/octavos-predictions-service';
import { fetchRoundOf16Predictions } from '../../services/round-of-16-predictions-service';
import { fetchSemisPredictions } from '../../services/semis-predictions-service';
import { fetchThirdPlacePredictions } from '../../services/third-place-predictions-service';
import type { GroupStageMatch, ParticipantPredictions } from '../../types/predictions';
import { GroupStagePredictionsPanel } from './GroupStagePredictionsPanel';
import { KnockoutStagePredictionsPanel } from './KnockoutStagePredictionsPanel';

type PredictionsPanelProps = {
  currentParticipant: string;
};

type PredictionSection =
  | 'group-stage'
  | 'round-of-16'
  | 'octavos'
  | 'cuartos'
  | 'semis'
  | 'final'
  | 'third-place';

const predictionSections: Array<{ id: PredictionSection; label: string }> = [
  { id: 'group-stage', label: 'Fase de Grupos' },
  { id: 'round-of-16', label: 'Dieciseisavos' },
  { id: 'octavos', label: 'Octavos' },
  { id: 'cuartos', label: 'Cuartos' },
  { id: 'semis', label: 'Semis' },
  { id: 'final', label: 'Final' },
  { id: 'third-place', label: '3y4' },
];

export function PredictionsPanel({ currentParticipant }: PredictionsPanelProps) {
  const [activeSection, setActiveSection] = useState<PredictionSection>('group-stage');
  const [groupStageMatches, setGroupStageMatches] = useState<GroupStageMatch[]>([]);
  const [roundOf16Participants, setRoundOf16Participants] = useState<ParticipantPredictions[]>([]);
  const [octavosParticipants, setOctavosParticipants] = useState<ParticipantPredictions[]>([]);
  const [cuartosParticipants, setCuartosParticipants] = useState<ParticipantPredictions[]>([]);
  const [semisParticipants, setSemisParticipants] = useState<ParticipantPredictions[]>([]);
  const [finalParticipants, setFinalParticipants] = useState<ParticipantPredictions[]>([]);
  const [thirdPlaceParticipants, setThirdPlaceParticipants] = useState<ParticipantPredictions[]>([]);
  const [isLoadingGroupStage, setIsLoadingGroupStage] = useState(false);
  const [isLoadingRoundOf16, setIsLoadingRoundOf16] = useState(false);
  const [isLoadingOctavos, setIsLoadingOctavos] = useState(false);
  const [isLoadingCuartos, setIsLoadingCuartos] = useState(false);
  const [isLoadingSemis, setIsLoadingSemis] = useState(false);
  const [isLoadingFinal, setIsLoadingFinal] = useState(false);
  const [isLoadingThirdPlace, setIsLoadingThirdPlace] = useState(false);
  const [groupStageError, setGroupStageError] = useState<string | null>(null);
  const [roundOf16Error, setRoundOf16Error] = useState<string | null>(null);
  const [octavosError, setOctavosError] = useState<string | null>(null);
  const [cuartosError, setCuartosError] = useState<string | null>(null);
  const [semisError, setSemisError] = useState<string | null>(null);
  const [finalError, setFinalError] = useState<string | null>(null);
  const [thirdPlaceError, setThirdPlaceError] = useState<string | null>(null);
  const hasRequestedGroupStageRef = useRef(false);
  const hasRequestedRoundOf16Ref = useRef(false);
  const hasRequestedOctavosRef = useRef(false);
  const hasRequestedCuartosRef = useRef(false);
  const hasRequestedSemisRef = useRef(false);
  const hasRequestedFinalRef = useRef(false);
  const hasRequestedThirdPlaceRef = useRef(false);

  useEffect(() => {
    if (activeSection === 'group-stage' && !hasRequestedGroupStageRef.current) {
      hasRequestedGroupStageRef.current = true;
      void loadGroupStagePredictions();
    }

    if (activeSection === 'round-of-16' && !hasRequestedRoundOf16Ref.current) {
      hasRequestedRoundOf16Ref.current = true;
      void loadRoundOf16Predictions();
    }

    if (activeSection === 'octavos' && !hasRequestedOctavosRef.current) {
      hasRequestedOctavosRef.current = true;
      void loadOctavosPredictions();
    }

    if (activeSection === 'cuartos' && !hasRequestedCuartosRef.current) {
      hasRequestedCuartosRef.current = true;
      void loadCuartosPredictions();
    }

    if (activeSection === 'semis' && !hasRequestedSemisRef.current) {
      hasRequestedSemisRef.current = true;
      void loadSemisPredictions();
    }

    if (activeSection === 'final' && !hasRequestedFinalRef.current) {
      hasRequestedFinalRef.current = true;
      void loadFinalPredictions();
    }

    if (activeSection === 'third-place' && !hasRequestedThirdPlaceRef.current) {
      hasRequestedThirdPlaceRef.current = true;
      void loadThirdPlacePredictions();
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

  async function loadRoundOf16Predictions() {
    setIsLoadingRoundOf16(true);
    setRoundOf16Error(null);

    try {
      const loadedParticipants = await fetchRoundOf16Predictions();
      setRoundOf16Participants(loadedParticipants);
    } catch (error) {
      setRoundOf16Error(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingRoundOf16(false);
    }
  }

  async function loadOctavosPredictions() {
    setIsLoadingOctavos(true);
    setOctavosError(null);

    try {
      const loadedParticipants = await fetchOctavosPredictions();
      setOctavosParticipants(loadedParticipants);
    } catch (error) {
      setOctavosError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingOctavos(false);
    }
  }

  async function loadCuartosPredictions() {
    setIsLoadingCuartos(true);
    setCuartosError(null);

    try {
      const loadedParticipants = await fetchCuartosPredictions();
      setCuartosParticipants(loadedParticipants);
    } catch (error) {
      setCuartosError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingCuartos(false);
    }
  }

  async function loadSemisPredictions() {
    setIsLoadingSemis(true);
    setSemisError(null);

    try {
      const loadedParticipants = await fetchSemisPredictions();
      setSemisParticipants(loadedParticipants);
    } catch (error) {
      setSemisError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingSemis(false);
    }
  }

  async function loadFinalPredictions() {
    setIsLoadingFinal(true);
    setFinalError(null);

    try {
      const loadedParticipants = await fetchFinalPredictions();
      setFinalParticipants(loadedParticipants);
    } catch (error) {
      setFinalError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingFinal(false);
    }
  }

  async function loadThirdPlacePredictions() {
    setIsLoadingThirdPlace(true);
    setThirdPlaceError(null);

    try {
      const loadedParticipants = await fetchThirdPlacePredictions();
      setThirdPlaceParticipants(loadedParticipants);
    } catch (error) {
      setThirdPlaceError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingThirdPlace(false);
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

      {activeSection === 'round-of-16' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={roundOf16Error}
          isLoading={isLoadingRoundOf16}
          participants={roundOf16Participants}
          title="Dieciseisavos"
        />
      ) : null}

      {activeSection === 'octavos' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={octavosError}
          isLoading={isLoadingOctavos}
          participants={octavosParticipants}
          title="Octavos"
        />
      ) : null}

      {activeSection === 'cuartos' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={cuartosError}
          isLoading={isLoadingCuartos}
          participants={cuartosParticipants}
          title="Cuartos"
        />
      ) : null}

      {activeSection === 'semis' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={semisError}
          isLoading={isLoadingSemis}
          participants={semisParticipants}
          title="Semis"
        />
      ) : null}

      {activeSection === 'final' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={finalError}
          isLoading={isLoadingFinal}
          participants={finalParticipants}
          title="Final"
        />
      ) : null}

      {activeSection === 'third-place' ? (
        <KnockoutStagePredictionsPanel
          currentParticipant={currentParticipant}
          error={thirdPlaceError}
          isLoading={isLoadingThirdPlace}
          participants={thirdPlaceParticipants}
          title="3y4"
        />
      ) : null}
    </div>
  );
}
