export type GroupStagePrediction = {
  participante: string;
  score: string;
};

export type GroupStageMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  predictions: GroupStagePrediction[];
};
