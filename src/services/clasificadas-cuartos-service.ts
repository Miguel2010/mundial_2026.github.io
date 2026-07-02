const SCORE_PATTERN = /^(\d+)-(\d+)$/;

export type ClasificadasCuartosHits = {
  count: number;
  teams: string[];
};

export type ClasificadasCuartosHitsData = Record<string, ClasificadasCuartosHits>;

function normalizeTeamName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
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

function getMatchWinner(
  matchLabel: string,
  score: string,
  penaltyWinner: string | undefined,
): string | null {
  const teams = getMatchTeams(matchLabel);

  if (!teams) {
    return null;
  }

  const parsed = parseScore(score);

  if (!parsed) {
    return null;
  }

  if (parsed.home > parsed.away) {
    return teams.homeTeam;
  }

  if (parsed.away > parsed.home) {
    return teams.awayTeam;
  }

  return penaltyWinner ?? null;
}

function parsePredictions(csv: string): Record<string, string[]> {
  const sanitized = csv.replace(/^\uFEFF/, '').trim();
  const lines = sanitized.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    return {};
  }

  const predictions: Record<string, string[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const participante = values[0];
    const matchLabel = values[2] ?? '';
    const score = values[3] ?? '';
    const rawPenaltyWinner = values[4] ?? '';

    if (!participante || !matchLabel || !score) {
      continue;
    }

    const penaltyWinner = rawPenaltyWinner || undefined;
    const winner = getMatchWinner(matchLabel, score, penaltyWinner);

    if (winner) {
      if (!predictions[participante]) {
        predictions[participante] = [];
      }

      predictions[participante].push(winner);
    }
  }

  return predictions;
}

function parseActualCuartosTeams(csv: string): string[] {
  const sanitized = csv.replace(/^\uFEFF/, '').trim();
  const lines = sanitized.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const teams: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const team = values[1];

    if (team) {
      teams.push(team);
    }
  }

  return teams;
}

async function fetchCsv(path: string): Promise<string> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}.`);
  }

  return response.text();
}

export async function fetchCuartosClasificadasHits(): Promise<ClasificadasCuartosHitsData> {
  const [actualCsv, predictionsCsv] = await Promise.all([
    fetchCsv('data/selecciones_clasificadas_eliminatorias.csv'),
    fetchCsv('data/pronostico_octavos.csv'),
  ]);

  const actualTeams = parseActualCuartosTeams(actualCsv);
  const normalizedActualTeams = new Set(actualTeams.map(normalizeTeamName));
  const predictions = parsePredictions(predictionsCsv);

  const hits: ClasificadasCuartosHitsData = {};

  for (const [participante, winners] of Object.entries(predictions)) {
    const uniqueTeams = new Set<string>();

    for (const winner of winners) {
      if (normalizedActualTeams.has(normalizeTeamName(winner))) {
        uniqueTeams.add(winner);
      }
    }

    hits[participante] = {
      count: uniqueTeams.size,
      teams: [...uniqueTeams],
    };
  }

  return hits;
}
