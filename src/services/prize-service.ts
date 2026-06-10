export type PrizeRow = {
  posicion: number;
  premio: number;
};

const PRIZES_URL = `${import.meta.env.BASE_URL}data/premios.csv`;
const REQUIRED_HEADERS = ['Posicion', 'Premio'] as const;

function toNumber(value: string | undefined) {
  const normalizedValue = value?.trim() ?? '';
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function parsePrizesCsv(csv: string): PrizeRow[] {
  const sanitizedCsv = csv.replace(/^\uFEFF/, '').trim();

  if (!sanitizedCsv) {
    return [];
  }

  const lines = sanitizedCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(/[;,]+/).map((header) => header.trim());
  const hasRequiredHeaders = REQUIRED_HEADERS.every((header) => headers.includes(header));

  if (!hasRequiredHeaders) {
    throw new Error('El formato del CSV de premios no coincide con lo esperado.');
  }

  return lines
    .slice(1)
    .map((line) => line.split(/[;,]+/).map((value) => value.trim()))
    .filter((values) => values.some(Boolean))
    .map((values) => {
      const rowRecord = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

      return {
        posicion: toNumber(rowRecord.Posicion),
        premio: toNumber(rowRecord.Premio),
      };
    })
    .filter((row) => row.posicion > 0)
    .sort((left, right) => left.posicion - right.posicion);
}

export async function fetchPrizes() {
  const response = await fetch(`${PRIZES_URL}?v=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No se encontró el archivo de premios.');
  }

  const csv = await response.text();
  const parsedRows = parsePrizesCsv(csv);

  if (parsedRows.length === 0) {
    throw new Error('El CSV de premios está vacío o no contiene filas válidas.');
  }

  return parsedRows;
}
