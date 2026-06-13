import type { GroupStageMatch, GroupStagePrediction } from '../types/predictions';
import { formatTeamName, getTeamFlag } from '../utils/teamFlags';

const PREDICTIONS_URL = `${import.meta.env.BASE_URL}data/pronostico_fase_grupos.csv`;

function createMatchId(matchHeader: string) {
  return matchHeader
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLocaleLowerCase('es');
}

function parseMatchHeader(matchHeader: string) {
  const [homeTeam, awayTeam, ...rest] = matchHeader.split('-');

  if (!homeTeam || !awayTeam || rest.length > 0) {
    throw new Error(`El partido "${matchHeader}" no tiene el formato esperado Equipo-Equipo.`);
  }

  return { homeTeam, awayTeam };
}

function parsePredictionsCsv(csv: string): GroupStageMatch[] {
  const sanitizedCsv = csv.replace(/^\uFEFF/, '').trim();

  if (!sanitizedCsv) {
    return [];
  }

  const lines = sanitizedCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim());

  if (headers[0] !== 'Participante' || headers.length <= 1) {
    throw new Error('El formato del CSV no coincide con los pronósticos esperados.');
  }

  const rows = lines
    .slice(1)
    .map((line) => line.split(',').map((value) => value.trim()))
    .filter((values) => values.some(Boolean));

  return headers.slice(1).map((matchHeader, matchIndex) => {
    const { homeTeam, awayTeam } = parseMatchHeader(matchHeader);
    const predictions = rows
      .map<GroupStagePrediction | null>((values) => {
        const participante = values[0]?.trim() ?? '';
        const score = values[matchIndex + 1]?.trim() ?? '';

        if (!participante || !score) {
          return null;
        }

        return { participante, score };
      })
      .filter((prediction): prediction is GroupStagePrediction => prediction !== null);

    return {
      id: createMatchId(matchHeader),
      homeTeam: formatTeamName(homeTeam),
      awayTeam: formatTeamName(awayTeam),
      homeFlag: getTeamFlag(homeTeam),
      awayFlag: getTeamFlag(awayTeam),
      predictions,
    };
  });
}

export async function fetchGroupStagePredictions() {
  const response = await fetch(`${PREDICTIONS_URL}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se encontró el archivo de pronósticos.');
  }

  const csv = await response.text();
  const parsedMatches = parsePredictionsCsv(csv);

  if (parsedMatches.length === 0) {
    throw new Error('El CSV de pronósticos está vacío o no contiene partidos válidos.');
  }

  return parsedMatches;
}
