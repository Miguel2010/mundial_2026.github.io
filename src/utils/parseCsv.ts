import type { ClassificationRow } from '../types/classification';
 
const REQUIRED_HEADERS = [
  'Posicion',
  'Participante',
  'Pts_Fase_Grupos',
  'Pts_16avos',
  'Pts_Octavos',
  'Pts_Cuartos',
  'Pts_Semifinales',
  'Pts_3y4_Puesto',
  'Pts_Final',
  'Puntos'
] as const;

function toNumber(value: string | undefined) {
  const normalizedValue = value?.trim() ?? '';
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toPhasePoints(value: string | undefined) {
  const normalizedValue = value?.trim() ?? '';
  const match = normalizedValue.match(/^(\d+)\s*(?:\((\d+)\))?$/);

  if (!match) {
    return { total: toNumber(normalizedValue), classified: null };
  }

  return {
    total: toNumber(match[1]),
    classified: match[2] ? toNumber(match[2]) : null,
  };
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
      const posicion = toNumber(rowRecord.Posicion);
      const grupos = toPhasePoints(rowRecord.Pts_Fase_Grupos);
      const dieciseisavos = toPhasePoints(rowRecord.Pts_16avos);
      const octavos = toPhasePoints(rowRecord.Pts_Octavos);
      const cuartos = toPhasePoints(rowRecord.Pts_Cuartos);
      const semifinales = toPhasePoints(rowRecord.Pts_Semifinales);
      const tercerCuarto = toPhasePoints(rowRecord.Pts_3y4_Puesto);
      const final = toPhasePoints(rowRecord.Pts_Final);
      const total = toNumber(rowRecord.Puntos);

      return {
        posicion,
        participante: rowRecord.Participante.trim(),
        grupos,
        dieciseisavos,
        octavos,
        cuartos,
        semifinales,
        tercerCuarto,
        final,
        total
      };
    })
    .sort((left, right) => left.posicion - right.posicion);
}
