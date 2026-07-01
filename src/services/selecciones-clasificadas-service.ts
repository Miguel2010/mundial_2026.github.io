type GroupStandings = {
  primera: string;
  segunda: string;
  tercera: string;
};

type GroupPredictions = {
  primera: string;
  segunda: string;
  tercera: string;
};

export type CorrectPrediction = {
  grupo: string;
  team: string;
};

export type ParticipantGroupHits = {
  primeras: number;
  segundas: number;
  terceras: number;
  primerasList: CorrectPrediction[];
  segundasList: CorrectPrediction[];
  tercerasList: CorrectPrediction[];
};

export type GroupHitsData = Record<string, ParticipantGroupHits>;

async function fetchCsv(path: string): Promise<string> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}.`);
  }

  return response.text();
}

function parseActualStandings(csv: string): Record<string, GroupStandings> {
  const sanitized = csv.replace(/^\uFEFF/, '').trim();
  const lines = sanitized.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) return {};

  const standings: Record<string, GroupStandings> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const grupo = values[0];
    if (!grupo) continue;

    standings[grupo] = {
      primera: values[1] ?? '',
      segunda: values[2] ?? '',
      tercera: values[3] ?? '',
    };
  }

  return standings;
}

function parsePredictions(csv: string): Record<string, Record<string, GroupPredictions>> {
  const sanitized = csv.replace(/^\uFEFF/, '').trim();
  const lines = sanitized.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) return {};

  const predictions: Record<string, Record<string, GroupPredictions>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const usuario = values[0];
    const grupo = values[1];
    if (!usuario || !grupo) continue;

    if (!predictions[usuario]) {
      predictions[usuario] = {};
    }

    predictions[usuario][grupo] = {
      primera: values[2] ?? '',
      segunda: values[3] ?? '',
      tercera: values[4] ?? '',
    };
  }

  return predictions;
}

function normalizeTeamName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
}

export async function fetchGroupHits(): Promise<GroupHitsData> {
  const [actualCsv, predictionsCsv] = await Promise.all([
    fetchCsv('data/selecciones_clasificadas.csv'),
    fetchCsv('data/pronostico_selecciones_clasificadas.csv'),
  ]);

  const actualStandings = parseActualStandings(actualCsv);
  const predictions = parsePredictions(predictionsCsv);

  const hits: GroupHitsData = {};

  for (const [usuario, groups] of Object.entries(predictions)) {
    const primerasList: CorrectPrediction[] = [];
    const segundasList: CorrectPrediction[] = [];
    const tercerasList: CorrectPrediction[] = [];

    for (const [grupo, prediction] of Object.entries(groups)) {
      const actual = actualStandings[grupo];
      if (!actual) continue;

      if (
        actual.primera &&
        normalizeTeamName(prediction.primera) === normalizeTeamName(actual.primera)
      ) {
        primerasList.push({ grupo, team: actual.primera });
      }

      if (
        actual.segunda &&
        normalizeTeamName(prediction.segunda) === normalizeTeamName(actual.segunda)
      ) {
        segundasList.push({ grupo, team: actual.segunda });
      }

      if (
        actual.tercera &&
        prediction.tercera &&
        normalizeTeamName(prediction.tercera) === normalizeTeamName(actual.tercera)
      ) {
        tercerasList.push({ grupo, team: actual.tercera });
      }
    }

    hits[usuario] = {
      primeras: primerasList.length,
      segundas: segundasList.length,
      terceras: tercerasList.length,
      primerasList,
      segundasList,
      tercerasList,
    };
  }

  return hits;
}
