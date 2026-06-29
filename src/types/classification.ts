export type PhasePoints = {
  total: number;
  classified: number | null;
};

export type ClassificationCsvRow = {
  posicion: number;
  participante: string;
  grupos: PhasePoints;
  dieciseisavos: PhasePoints;
  octavos: PhasePoints;
  cuartos: PhasePoints;
  semifinales: PhasePoints;
  tercerCuarto: PhasePoints;
  final: PhasePoints;
};

export type ClassificationRow = ClassificationCsvRow & {
  total: number;
};
