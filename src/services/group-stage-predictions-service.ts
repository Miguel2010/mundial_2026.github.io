import type { GroupStageMatch, GroupStagePrediction } from '../types/predictions';
import { formatTeamName, getTeamFlag } from '../utils/teamFlags';

const PREDICTIONS_URL = `${import.meta.env.BASE_URL}data/pronostico_fase_grupos.csv`;
const STATUS_URL = `${import.meta.env.BASE_URL}data/fase_grupos_estado.csv`;
const SCORE_PATTERN = /^\d+-\d+$/;

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

function parsePlayedStatusCsv(csv: string) {
  const sanitizedCsv = csv.replace(/^\uFEFF/, '').trim();

  if (!sanitizedCsv) {
    return new Map<string, { played: boolean; result?: string }>();
  }

  const lines = sanitizedCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return new Map<string, { played: boolean; result?: string }>();
  }

  const headers = lines[0].split(',').map((header) => header.trim());

  if (headers[0] !== 'match' || headers[1] !== 'played' || headers[2] !== 'result') {
    throw new Error('El formato del CSV de estado de fase de grupos no es válido.');
  }

  return lines.slice(1).reduce((statusByMatchId, line) => {
    const [matchHeader = '', playedValue = '', rawResult = ''] = line
      .split(',')
      .map((value) => value.trim());

    if (!matchHeader) {
      return statusByMatchId;
    }

    if (playedValue !== 'true' && playedValue !== 'false') {
      throw new Error(`El estado del partido "${matchHeader}" debe ser true o false.`);
    }

    const result = rawResult.replace(/\s+/g, '');

    if (playedValue === 'true' && !SCORE_PATTERN.test(result)) {
      throw new Error(`El resultado del partido "${matchHeader}" debe tener formato 0-0.`);
    }

    if (playedValue === 'false' && result) {
      throw new Error(`El partido "${matchHeader}" no puede tener resultado si no está jugado.`);
    }

    statusByMatchId.set(createMatchId(matchHeader), {
      played: playedValue === 'true',
      result: result || undefined,
    });

    return statusByMatchId;
  }, new Map<string, { played: boolean; result?: string }>());
}

export async function fetchGroupStagePredictions() {
  const cacheKey = Date.now();
  const [predictionsResponse, statusResponse] = await Promise.all([
    fetch(`${PREDICTIONS_URL}?v=${cacheKey}`, {
      cache: 'no-store',
    }),
    fetch(`${STATUS_URL}?v=${cacheKey}`, {
      cache: 'no-store',
    }),
  ]);

  if (!predictionsResponse.ok) {
    throw new Error('No se encontró el archivo de pronósticos.');
  }

  if (!statusResponse.ok) {
    throw new Error('No se encontró el archivo de estado de la fase de grupos.');
  }

  const [predictionsCsv, statusCsv] = await Promise.all([
    predictionsResponse.text(),
    statusResponse.text(),
  ]);

  const statusByMatchId = parsePlayedStatusCsv(statusCsv);
  const parsedMatches = parsePredictionsCsv(predictionsCsv).map((match) => {
    const status = statusByMatchId.get(match.id);

    return {
      ...match,
      played: status?.played ?? false,
      result: status?.result,
    };
  });


  if (parsedMatches.length === 0) {
    throw new Error('El CSV de pronósticos está vacío o no contiene partidos válidos.');
  }

  const pendingMatches = parsedMatches.filter((match) => !match.played);
  const playedMatches = parsedMatches.filter((match) => match.played);

  return [...pendingMatches, ...playedMatches];
}
