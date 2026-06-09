export type ClassificationCsvRow = {
  posicion: number;
  participante: string;
  grupos: number;
  dieciseisavos: number;
  octavos: number;
  cuartos: number;
  semifinales: number;
  tercerCuarto: number;
  final: number;
};

export type ClassificationRow = ClassificationCsvRow & {
  total: number;
};
