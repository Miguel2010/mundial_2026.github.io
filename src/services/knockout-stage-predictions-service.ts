import type { ParticipantPredictionRow, ParticipantPredictions } from '../types/predictions';

type KnockoutStageCsvRow = {
  participante: string;
  matchId: string;
  matchLabel: string;
  score: string;
};

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

function parseCsvRows(csv: string, stageLabel: string): KnockoutStageCsvRow[] {
  const sanitizedCsv = csv.replace(/^\uFEFF/, '').trim();

  if (!sanitizedCsv) {
    return [];
  }

  const lines = sanitizedCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  const expectedHeaders = ['Nombre', 'ID_Partido', 'Partido', 'Resultados'];

  if (expectedHeaders.some((header, index) => headers[index] !== header)) {
    throw new Error(`El formato del CSV de ${stageLabel} no coincide con lo esperado.`);
  }

  return lines
    .slice(1)
    .map((line) => line.split(',').map((value) => value.trim()))
    .map<KnockoutStageCsvRow | null>((values) => {
      const participante = values[0] ?? '';
      const matchId = values[1] ?? '';
      const matchLabel = values[2] ?? '';
      const score = values[3] ?? '';

      if (!participante || !matchId || !matchLabel || !score) {
        return null;
      }

      return {
        participante,
        matchId,
        matchLabel,
        score,
      };
    })
    .filter((row): row is KnockoutStageCsvRow => row !== null);
}

function parsePredictionsCsv(csv: string, stageLabel: string): ParticipantPredictions[] {
  const rows = parseCsvRows(csv, stageLabel);
  const predictionsByParticipant = new Map<string, ParticipantPredictions>();

  rows.forEach((row) => {
    const existingParticipant = predictionsByParticipant.get(row.participante);
    const prediction: ParticipantPredictionRow = {
      matchId: row.matchId,
      matchLabel: row.matchLabel,
      score: row.score,
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

  return [...predictionsByParticipant.values()].map((participantPredictions) => ({
    ...participantPredictions,
    predictions: sortPredictionsByMatchId(participantPredictions.predictions),
  }));
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

  if (parsedPredictions.length === 0) {
    throw new Error(`El CSV de ${stageLabel} está vacío o no contiene partidos válidos.`);
  }

  return parsedPredictions;
}
