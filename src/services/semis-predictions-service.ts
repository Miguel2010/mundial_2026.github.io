import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchSemisPredictions() {
  return fetchKnockoutStagePredictions('data/pronostico_semis.csv', 'semis');
}
