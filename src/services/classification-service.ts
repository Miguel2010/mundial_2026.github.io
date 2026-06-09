import { parseClassificationCsv } from '../utils/parseCsv';

const CSV_URL = `${import.meta.env.BASE_URL}data/ranking.csv`;

export async function fetchClassification() {
  const response = await fetch(`${CSV_URL}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se encontró el archivo de clasificación.');
  }

  const csv = await response.text();
  const parsedRows = parseClassificationCsv(csv);

  if (parsedRows.length === 0) {
    throw new Error('El CSV está vacío o no contiene filas válidas.');
  }

  return parsedRows;
}
