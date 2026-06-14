import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchCuartosPredictions() {
  return fetchKnockoutStagePredictions('data/pronostico_cuartos.csv', 'cuartos');
}
