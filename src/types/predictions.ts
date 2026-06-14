export type Prediction = {
  participante: string;
  score: string;
};

export type PredictionMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  predictions: Prediction[];
};

export type ParticipantPredictionRow = {
  matchId: string;
  matchLabel: string;
  score: string;
};

export type ParticipantPredictions = {
  participante: string;
  predictions: ParticipantPredictionRow[];
};

export type GroupStagePrediction = Prediction;

export type GroupStageMatch = PredictionMatch;
