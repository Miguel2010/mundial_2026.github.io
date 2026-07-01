type SectionId =
  | 'group-stage'
  | 'round-of-16'
  | 'octavos'
  | 'cuartos'
  | 'semis'
  | 'third-place'
  | 'final';

type GoalsByPhaseData = {
  adminGoals: Record<SectionId, number>;
  participantGoals: Record<string, Record<SectionId, number>>;
};

const COLUMN_TO_SECTION: Record<string, SectionId> = {
  goles_grupos: 'group-stage',
  goles_dieciseisavos: 'round-of-16',
  goles_octavos: 'octavos',
  goles_cuartos: 'cuartos',
  goles_semis: 'semis',
  goles_3_y_4: 'third-place',
  goles_final: 'final',
};

function parseGoalsValue(value: string): number {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/^\(|\)$/g, '');
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchGoalsByPhase(): Promise<GoalsByPhaseData> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/total_goles_fases.csv?v=${Date.now()}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('No se pudo cargar el archivo de goles por fase.');
  }

  const csv = await response.text();
  const sanitized = csv.replace(/^\uFEFF/, '').trim();
  const lines = sanitized.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    return { adminGoals: {} as Record<SectionId, number>, participantGoals: {} };
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const sectionColumns: Array<{ index: number; section: SectionId }> = [];

  for (let i = 0; i < headers.length; i++) {
    const section = COLUMN_TO_SECTION[headers[i]];
    if (section) {
      sectionColumns.push({ index: i, section });
    }
  }

  const adminGoals = {} as Record<SectionId, number>;
  const participantGoals: Record<string, Record<SectionId, number>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const name = values[0];

    if (!name) continue;

    const phaseGoals: Record<string, number> = {};

    for (const { index, section } of sectionColumns) {
      const rawValue = values[index] ?? '0';
      phaseGoals[section] = parseGoalsValue(rawValue);
    }

    if (name === 'ADMIN') {
      Object.assign(adminGoals, phaseGoals);
    } else {
      participantGoals[name] = phaseGoals as Record<SectionId, number>;
    }
  }

  return { adminGoals, participantGoals };
}
