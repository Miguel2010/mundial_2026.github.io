import type {
  KnockoutStagePredictions,
  ParticipantPredictionRow,
  ParticipantPredictions,
} from '../types/predictions';
import { normalizeParticipantName } from '../utils/participants';

type KnockoutStageCsvRow = {
  participante: string;
  matchId: string;
  matchLabel: string;
  score: string;
  penaltyWinner?: string;
};

type PenaltyDataIssue = {
  kind: 'invalid-penalty-winner' | 'missing-penalty-winner';
  matchLabel: string;
  participante: string;
};

type PenaltyDataIssues = {
  details: PenaltyDataIssue[];
};

type ParsedKnockoutRows = {
  issues: PenaltyDataIssues;
  rows: KnockoutStageCsvRow[];
};

const SCORE_PATTERN = /^(\d+)-(\d+)$/;

function getMatchSequence(matchId: string) {
  const sequence = Number.parseInt(matchId.replace(/\D+/g, ''), 10);

  return Number.isNaN(sequence) ? Number.MAX_SAFE_INTEGER : sequence;
}

function sortPredictionsByMatchId(predictions: ParticipantPredictionRow[]) {
  return [...predictions].sort((left, right) => {
    const sequenceDifference = getMatchSequence(left.matchId) - getMatchSequence(right.matchId);

    if (sequenceDifference !== 0) {
      return sequenceDifference;
    }

    return left.matchId.localeCompare(right.matchId, 'es');
  });
}

function createEmptyIssues(): PenaltyDataIssues {
  return {
    details: [],
  };
}

function parseScore(score: string) {
  const match = score.trim().match(SCORE_PATTERN);

  if (!match) {
    return null;
  }

  return {
    away: Number.parseInt(match[2], 10),
    home: Number.parseInt(match[1], 10),
  };
}

function isDrawScore(score: string) {
  const parsedScore = parseScore(score);

  return parsedScore !== null && parsedScore.home === parsedScore.away;
}

function getMatchTeams(matchLabel: string) {
  const [homeTeam, awayTeam, ...rest] = matchLabel.split('-');

  if (!homeTeam || !awayTeam || rest.length > 0) {
    return null;
  }

  return {
    awayTeam: awayTeam.trim(),
    homeTeam: homeTeam.trim(),
  };
}

function createPenaltyWarningMessages(stageLabel: string, issues: PenaltyDataIssues) {
  return issues.details.map((issue) => {
    if (issue.kind === 'missing-penalty-winner') {
      return `${issue.participante} · ${issue.matchLabel}: empate sin ganador por penaltis en el CSV de ${stageLabel}.`;
    }

    return `${issue.participante} · ${issue.matchLabel}: ganador por penaltis no válido en el CSV de ${stageLabel}.`;
  });
}

function parseCsvRows(csv: string, stageLabel: string): ParsedKnockoutRows {
  const sanitizedCsv = csv.replace(/^\uFEFF/, '').trim();

  if (!sanitizedCsv) {
    return {
      issues: createEmptyIssues(),
      rows: [],
    };
  }

  const lines = sanitizedCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return {
      issues: createEmptyIssues(),
      rows: [],
    };
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  const expectedHeaders = ['Nombre', 'ID_Partido', 'Partido', 'Resultados', 'Ganador_Penaltis'];

  if (expectedHeaders.some((header, index) => headers[index] !== header)) {
    throw new Error(`El formato del CSV de ${stageLabel} no coincide con lo esperado.`);
  }

  const issues = createEmptyIssues();
  const rows = lines
    .slice(1)
    .map((line) => line.split(',').map((value) => value.trim()))
    .map<KnockoutStageCsvRow | null>((values) => {
      const participante = values[0] ?? '';
      const matchId = values[1] ?? '';
      const matchLabel = values[2] ?? '';
      const score = values[3] ?? '';
      const rawPenaltyWinner = values[4] ?? '';

      if (!participante || !matchId || !matchLabel || !score) {
        return null;
      }

      const hasDrawScore = isDrawScore(score);

      if (!hasDrawScore) {
        return {
          participante,
          matchId,
          matchLabel,
          score,
        };
      }

      if (!rawPenaltyWinner) {
        issues.details.push({
          kind: 'missing-penalty-winner',
          matchLabel,
          participante,
        });

        return {
          participante,
          matchId,
          matchLabel,
          score,
        };
      }

      const teams = getMatchTeams(matchLabel);
      const normalizedPenaltyWinner = normalizeParticipantName(rawPenaltyWinner);
      const isValidPenaltyWinner =
        teams !== null &&
        [teams.homeTeam, teams.awayTeam].some(
          (teamName) => normalizeParticipantName(teamName) === normalizedPenaltyWinner,
        );

      if (!isValidPenaltyWinner) {
        issues.details.push({
          kind: 'invalid-penalty-winner',
          matchLabel,
          participante,
        });

        return {
          participante,
          matchId,
          matchLabel,
          score,
        };
      }

      return {
        participante,
        matchId,
        matchLabel,
        score,
        penaltyWinner: rawPenaltyWinner,
      };
    })
    .filter((row): row is KnockoutStageCsvRow => row !== null);

  return { issues, rows };
}

function parsePredictionsCsv(csv: string, stageLabel: string): KnockoutStagePredictions {
  const { issues, rows } = parseCsvRows(csv, stageLabel);
  const predictionsByParticipant = new Map<string, ParticipantPredictions>();

  rows.forEach((row) => {
    const existingParticipant = predictionsByParticipant.get(row.participante);
    const prediction: ParticipantPredictionRow = {
      matchId: row.matchId,
      matchLabel: row.matchLabel,
      score: row.score,
      penaltyWinner: row.penaltyWinner,
    };

    if (existingParticipant) {
      predictionsByParticipant.set(row.participante, {
        ...existingParticipant,
        predictions: [...existingParticipant.predictions, prediction],
      });

      return;
    }

    predictionsByParticipant.set(row.participante, {
      participante: row.participante,
      predictions: [prediction],
    });
  });

  return {
    participants: [...predictionsByParticipant.values()].map((participantPredictions) => ({
      ...participantPredictions,
      predictions: sortPredictionsByMatchId(participantPredictions.predictions),
    })),
    warnings: createPenaltyWarningMessages(stageLabel, issues),
  };
}

export async function fetchKnockoutStagePredictions(csvPath: string, stageLabel: string) {
  const response = await fetch(`${import.meta.env.BASE_URL}${csvPath}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`No se encontró el archivo de pronósticos de ${stageLabel}.`);
  }

  const csv = await response.text();
  const parsedPredictions = parsePredictionsCsv(csv, stageLabel);

  if (parsedPredictions.participants.length === 0) {
    throw new Error(`El CSV de ${stageLabel} está vacío o no contiene partidos válidos.`);
  }

  return parsedPredictions;
}
