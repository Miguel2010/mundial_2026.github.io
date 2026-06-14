import { fetchKnockoutStagePredictions } from './knockout-stage-predictions-service';

export function fetchRoundOf16Predictions() {
  return fetchKnockoutStagePredictions('data/pronostico_16avos.csv', 'dieciseisavos');
}
