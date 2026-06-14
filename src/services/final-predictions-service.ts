import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchFinalPredictions() {
  return fetchKnockoutStagePredictions('data/pronostico_final.csv', 'final');
}
