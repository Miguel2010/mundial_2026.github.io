import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchOctavosPredictions() {
  return fetchKnockoutStagePredictions('data/pronostico_octavos.csv', 'octavos');
}
