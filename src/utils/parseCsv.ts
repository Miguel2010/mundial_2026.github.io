import type { ClassificationRow } from '../types/classification';

const REQUIRED_HEADERS = [
  'nombre',
  'grupos',
  'dieciseisavos',
  'octavos',
  'cuartos',
  'semifinales',
  'final',
  'tercer_cuarto',
] as const;

function toNumber(value: string | undefined) {
  const normalizedValue = value?.trim() ?? '';
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function parseClassificationCsv(csv: string): ClassificationRow[] {
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
    throw new Error('El formato del CSV no coincide con la clasificación esperada.');
  }

  return lines
    .slice(1)
    .map((line) => line.split(/[;,]+/).map((value) => value.trim()))
    .filter((values) => values.some(Boolean))
    .map((values) => {
      const rowRecord = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
      const grupos = toNumber(rowRecord.grupos);
      const dieciseisavos = toNumber(rowRecord.dieciseisavos);
      const octavos = toNumber(rowRecord.octavos);
      const cuartos = toNumber(rowRecord.cuartos);
      const semifinales = toNumber(rowRecord.semifinales);
      const final = toNumber(rowRecord.final);
      const tercerCuarto = toNumber(rowRecord.tercer_cuarto);

      return {
        nombre: rowRecord.nombre.trim(),
        grupos,
        dieciseisavos,
        octavos,
        cuartos,
        semifinales,
        final,
        tercerCuarto,
        total:
          grupos +
          dieciseisavos +
          octavos +
          cuartos +
          semifinales +
          final +
          tercerCuarto,
      };
    })
    .sort((left, right) => right.total - left.total);
}
