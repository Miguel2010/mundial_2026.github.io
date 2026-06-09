const REPOSITORY_OWNER = 'Miguel2010';
const REPOSITORY_NAME = 'mundial_2026.github.io';
const CSV_PATH = 'data/ranking.csv';

export type CsvUpdateInfo = {
  updatedAtIso: string;
  updatedAtLabel: string;
};

export async function fetchCsvUpdateInfo(): Promise<CsvUpdateInfo> {
  const response = await fetch(
    `https://api.github.com/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/commits?path=${CSV_PATH}&per_page=1`,
  );

  if (!response.ok) {
    throw new Error('No se pudo consultar la última actualización.');
  }

  const commits = (await response.json()) as Array<{
    commit?: {
      author?: {
        date?: string;
      };
    };
  }>;

  const dateValue = commits[0]?.commit?.author?.date;

  if (!dateValue) {
    throw new Error('No hay commits disponibles para el CSV.');
  }

  const updatedAt = new Date(dateValue);
  const dateLabel = updatedAt.toLocaleDateString('es-ES');
  const timeLabel = updatedAt.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    updatedAtIso: dateValue,
    updatedAtLabel: `Última actualización: ${dateLabel} a las ${timeLabel}`,
  };
}

export async function fetchLastUpdateLabel() {
  const updateInfo = await fetchCsvUpdateInfo();
  return updateInfo.updatedAtLabel;
}
