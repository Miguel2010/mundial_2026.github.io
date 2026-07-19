import { useEffect, useRef, useState } from 'react';
import { fetchClasificadasHits } from '../../services/clasificadas-eliminatorias-service';
import type { ClasificadasHits } from '../../services/clasificadas-eliminatorias-service';
import { fetchCuartosClasificadasHits } from '../../services/clasificadas-cuartos-service';
import type { ClasificadasCuartosHits } from '../../services/clasificadas-cuartos-service';
import { fetchSemisClasificadasHits } from '../../services/clasificadas-semis-service';
import type { ClasificadasSemisHits } from '../../services/clasificadas-semis-service';
import { fetchFinalClasificadasHits } from '../../services/clasificadas-final-service';
import type { ClasificadasFinalHits } from '../../services/clasificadas-final-service';
import { fetch3y4ClasificadasHits } from '../../services/clasificadas-3y4-service';
import type { Clasificadas3y4Hits } from '../../services/clasificadas-3y4-service';
import { fetchCuartosPredictions } from '../../services/cuartos-predictions-service';
import { fetchFinalPredictions } from '../../services/final-predictions-service';
import { fetchGoalsByPhase } from '../../services/goles-fases-service';
import { fetchGroupHits } from '../../services/selecciones-clasificadas-service';
import type { ParticipantGroupHits } from '../../services/selecciones-clasificadas-service';
import { fetchGroupStagePredictions } from '../../services/group-stage-predictions-service';
import { fetchOctavosPredictions } from '../../services/octavos-predictions-service';
import { fetchRoundOf16Predictions } from '../../services/round-of-16-predictions-service';
import { fetchSemisPredictions } from '../../services/semis-predictions-service';
import { fetchThirdPlacePredictions } from '../../services/third-place-predictions-service';
import type {
  GroupStageMatch,
  KnockoutStagePredictions,
  ParticipantPredictions,
} from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';
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
  { id: 'third-place', label: '3y4' },
  { id: 'final', label: 'Final' },
];

export function PredictionsPanel({ currentParticipant }: PredictionsPanelProps) {
  const [activeSection, setActiveSection] = useState<PredictionSection>('final');
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
  const [goalsData, setGoalsData] = useState<{
    adminGoals: Record<string, number>;
    participantGoals: Record<string, Record<string, number>>;
  } | null>(null);
  const [clasificadasHits, setClasificadasHits] = useState<Record<string, ClasificadasHits> | null>(null);
  const [cuartosClasificadasHits, setCuartosClasificadasHits] = useState<Record<string, ClasificadasCuartosHits> | null>(null);
  const [semisClasificadasHits, setSemisClasificadasHits] = useState<Record<string, ClasificadasSemisHits> | null>(null);
  const [finalClasificadasHits, setFinalClasificadasHits] = useState<Record<string, ClasificadasFinalHits> | null>(null);
  const [terceraClasificadasHits, setTerceraClasificadasHits] = useState<Record<string, Clasificadas3y4Hits> | null>(null);
  const [groupHits, setGroupHits] = useState<Record<string, ParticipantGroupHits> | null>(null);
  const [roundOf16Warnings, setRoundOf16Warnings] = useState<string[]>([]);
  const [octavosWarnings, setOctavosWarnings] = useState<string[]>([]);
  const [cuartosWarnings, setCuartosWarnings] = useState<string[]>([]);
  const [semisWarnings, setSemisWarnings] = useState<string[]>([]);
  const [finalWarnings, setFinalWarnings] = useState<string[]>([]);
  const [thirdPlaceWarnings, setThirdPlaceWarnings] = useState<string[]>([]);
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

  useEffect(() => {
    async function loadGoalsData() {
      try {
        const data = await fetchGoalsByPhase();
        setGoalsData(data);
      } catch {
        // Silently fail — goals data is non-critical
      }
    }

    async function loadGroupHits() {
      try {
        const data = await fetchGroupHits();
        setGroupHits(data);
      } catch {
        // Silently fail — group hits data is non-critical
      }
    }

    async function loadClasificadasHits() {
      try {
        const data = await fetchClasificadasHits();
        setClasificadasHits(data);
      } catch {
        // Silently fail — clasificadas hits data is non-critical
      }
    }

    async function loadCuartosClasificadasHits() {
      try {
        const data = await fetchCuartosClasificadasHits();
        setCuartosClasificadasHits(data);
      } catch {
        // Silently fail — cuartos clasificadas hits data is non-critical
      }
    }

    async function loadSemisClasificadasHits() {
      try {
        const data = await fetchSemisClasificadasHits();
        setSemisClasificadasHits(data);
      } catch {
        // Silently fail — semis clasificadas hits data is non-critical
      }
    }

    async function loadFinalClasificadasHits() {
      try {
        const data = await fetchFinalClasificadasHits();
        setFinalClasificadasHits(data);
      } catch {
        // Silently fail — final clasificadas hits data is non-critical
      }
    }

    async function loadTerceraClasificadasHits() {
      try {
        const data = await fetch3y4ClasificadasHits();
        setTerceraClasificadasHits(data);
      } catch {
        // Silently fail — 3y4 clasificadas hits data is non-critical
      }
    }

    void loadGoalsData();
    void loadGroupHits();
    void loadClasificadasHits();
    void loadCuartosClasificadasHits();
    void loadSemisClasificadasHits();
    void loadFinalClasificadasHits();
    void loadTerceraClasificadasHits();
  }, []);

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

  function applyKnockoutStagePredictions(
    loadedPredictions: KnockoutStagePredictions,
    setParticipants: (participants: ParticipantPredictions[]) => void,
    setWarnings: (warnings: string[]) => void,
  ) {
    setParticipants(loadedPredictions.participants);
    setWarnings(loadedPredictions.warnings);
  }

  async function loadRoundOf16Predictions() {
    setIsLoadingRoundOf16(true);
    setRoundOf16Error(null);
    setRoundOf16Warnings([]);

    try {
      const loadedPredictions = await fetchRoundOf16Predictions();
      applyKnockoutStagePredictions(
        loadedPredictions,
        setRoundOf16Participants,
        setRoundOf16Warnings,
      );
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
    setOctavosWarnings([]);

    try {
      const loadedPredictions = await fetchOctavosPredictions();
      applyKnockoutStagePredictions(loadedPredictions, setOctavosParticipants, setOctavosWarnings);
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
    setCuartosWarnings([]);

    try {
      const loadedPredictions = await fetchCuartosPredictions();
      applyKnockoutStagePredictions(loadedPredictions, setCuartosParticipants, setCuartosWarnings);
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
    setSemisWarnings([]);

    try {
      const loadedPredictions = await fetchSemisPredictions();
      applyKnockoutStagePredictions(loadedPredictions, setSemisParticipants, setSemisWarnings);
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
    setFinalWarnings([]);

    try {
      const loadedPredictions = await fetchFinalPredictions();
      applyKnockoutStagePredictions(loadedPredictions, setFinalParticipants, setFinalWarnings);
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
    setThirdPlaceWarnings([]);

    try {
      const loadedPredictions = await fetchThirdPlacePredictions();
      applyKnockoutStagePredictions(
        loadedPredictions,
        setThirdPlaceParticipants,
        setThirdPlaceWarnings,
      );
    } catch (error) {
      setThirdPlaceError(
        error instanceof Error ? error.message : 'No se pudieron cargar los pronósticos.',
      );
    } finally {
      setIsLoadingThirdPlace(false);
    }
  }

  function getSectionGoals(section: PredictionSection) {
    if (!goalsData) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const participantEntry = Object.entries(goalsData.participantGoals).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    const predicted = participantEntry?.[1]?.[section] ?? 0;
    const actual = goalsData.adminGoals[section] ?? 0;

    return { predicted, actual };
  }

  function getCurrentParticipantHits(): ParticipantGroupHits | null {
    if (!groupHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(groupHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
  }

  function getCurrentClasificadasHits(): ClasificadasHits | null {
    if (!clasificadasHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(clasificadasHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
  }

  function getCurrentCuartosClasificadasHits(): ClasificadasCuartosHits | null {
    if (!cuartosClasificadasHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(cuartosClasificadasHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
  }

  function getCurrentSemisClasificadasHits(): ClasificadasSemisHits | null {
    if (!semisClasificadasHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(semisClasificadasHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
  }

  function getCurrentFinalClasificadasHits(): ClasificadasFinalHits | null {
    if (!finalClasificadasHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(finalClasificadasHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
  }

  function getCurrentTerceraClasificadasHits(): Clasificadas3y4Hits | null {
    if (!terceraClasificadasHits) return null;

    const normalizedName = normalizeParticipantName(currentParticipant);
    const entry = Object.entries(terceraClasificadasHits).find(
      ([name]) => normalizeParticipantName(name) === normalizedName,
    );

    return entry?.[1] ?? null;
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
          goalsData={getSectionGoals('group-stage')}
          isLoading={isLoadingGroupStage}
          matches={groupStageMatches}
        />
      ) : null}

      {activeSection === 'round-of-16' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={null}
          currentParticipant={currentParticipant}
          error={roundOf16Error}
          goalsData={getSectionGoals('round-of-16')}
          groupHits={getCurrentParticipantHits()}
          isLoading={isLoadingRoundOf16}
          participants={roundOf16Participants}
          title="Dieciseisavos"
          warnings={roundOf16Warnings}
        />
      ) : null}

      {activeSection === 'octavos' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={getCurrentClasificadasHits()}
          currentParticipant={currentParticipant}
          error={octavosError}
          goalsData={getSectionGoals('octavos')}
          groupHits={null}
          isLoading={isLoadingOctavos}
          participants={octavosParticipants}
          title="Octavos"
          warnings={octavosWarnings}
        />
      ) : null}

      {activeSection === 'cuartos' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={getCurrentCuartosClasificadasHits()}
          currentParticipant={currentParticipant}
          error={cuartosError}
          goalsData={getSectionGoals('cuartos')}
          groupHits={null}
          isLoading={isLoadingCuartos}
          participants={cuartosParticipants}
          title="Cuartos"
          warnings={cuartosWarnings}
        />
      ) : null}

      {activeSection === 'semis' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={getCurrentSemisClasificadasHits()}
          currentParticipant={currentParticipant}
          error={semisError}
          goalsData={getSectionGoals('semis')}
          groupHits={null}
          isLoading={isLoadingSemis}
          participants={semisParticipants}
          title="Semis"
          warnings={semisWarnings}
        />
      ) : null}

      {activeSection === 'final' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={getCurrentFinalClasificadasHits()}
          currentParticipant={currentParticipant}
          error={finalError}
          goalsData={getSectionGoals('final')}
          groupHits={null}
          isLoading={isLoadingFinal}
          participants={finalParticipants}
          title="Final"
          warnings={finalWarnings}
        />
      ) : null}

      {activeSection === 'third-place' ? (
        <KnockoutStagePredictionsPanel
          clasificadasHits={getCurrentTerceraClasificadasHits()}
          currentParticipant={currentParticipant}
          error={thirdPlaceError}
          goalsData={getSectionGoals('third-place')}
          groupHits={null}
          isLoading={isLoadingThirdPlace}
          participants={thirdPlaceParticipants}
          title="3y4"
          warnings={thirdPlaceWarnings}
        />
      ) : null}
    </div>
  );
}
