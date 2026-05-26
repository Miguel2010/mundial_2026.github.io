export type ClassificationCsvRow = {
  nombre: string;
  grupos: number;
  dieciseisavos: number;
  octavos: number;
  cuartos: number;
  semifinales: number;
  final: number;
  tercerCuarto: number;
};

export type ClassificationRow = ClassificationCsvRow & {
  total: number;
};
