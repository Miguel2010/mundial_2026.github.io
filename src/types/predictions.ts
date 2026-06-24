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
  played?: boolean;
  result?: string;
};

export type ParticipantPredictionRow = {
  matchId: string;
  matchLabel: string;
  score: string;
  penaltyWinner?: string;
};

export type ParticipantPredictions = {
  participante: string;
  predictions: ParticipantPredictionRow[];
};

export type KnockoutStagePredictions = {
  participants: ParticipantPredictions[];
  warnings: string[];
};

export type GroupStagePrediction = Prediction;

export type GroupStageMatch = PredictionMatch;
