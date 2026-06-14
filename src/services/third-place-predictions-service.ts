import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchThirdPlacePredictions() {
  return fetchKnockoutStagePredictions('data/pronostico_3y4.csv', '3y4');
}
