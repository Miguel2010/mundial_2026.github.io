import type { PredictionMatch } from '../../types/predictions';
import { normalizeParticipantName } from '../../utils/participants';

export type PredictionOutcome = 'exact' | 'partial' | 'incorrect';
export type PredictionOutcomeSummary = Record<'played' | PredictionOutcome, number>;

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

export function getPredictionOutcome(predictedScore: string, finalResult?: string): PredictionOutcome | null {
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

export function getPredictionOutcomeLabel(outcome: PredictionOutcome) {
  if (outcome === 'exact') {
    return 'Exacto';
  }

  if (outcome === 'partial') {
    return 'Parcial';
  }

  return 'Incorrecto';
}

export function getCurrentParticipantOutcome(
  match: PredictionMatch,
  currentParticipant: string,
): PredictionOutcome | null {
  if (!match.played || !match.result) {
    return null;
  }

  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const currentParticipantPrediction = match.predictions.find(
    (prediction) =>
      normalizeParticipantName(prediction.participante) === normalizedCurrentParticipant,
  );

  if (!currentParticipantPrediction) {
    return null;
  }

  return getPredictionOutcome(currentParticipantPrediction.score, match.result);
}

export function getPredictionOutcomeSummary(
  matches: PredictionMatch[],
  currentParticipant: string,
): PredictionOutcomeSummary {
  return matches.reduce<PredictionOutcomeSummary>(
    (summary, match) => {
      const outcome = getCurrentParticipantOutcome(match, currentParticipant);

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
