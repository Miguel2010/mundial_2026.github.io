type ScoringRule = {
  label: string;
  points?: string;
};

type PhaseCriteria = {
  title: string;
  description: string;
  rules: ScoringRule[];
  note?: string;
};

const summaryItems = [
  'La clasificacion se ordena por el total de puntos acumulados durante toda la competicion.',
  'En dieciseisavos, octavos, cuartos y semifinales, el partido debe acertarse en el mismo orden del cuadro.',
  'En la final y en el partido por el tercer puesto, el orden de los equipos puede ser cualquiera si ambos juegan ese partido.',
  'Los resultados cuentan hasta el final de la prorroga si la hay; los penaltis no se tienen en cuenta.',
];

const commonRules: ScoringRule[] = [
  { label: 'Acertar el signo del partido (1-X-2)', points: '10 pts' },
  { label: 'Acertar el resultado exacto del partido', points: '15 pts' },
  { label: 'Acertar goles exactos de cada equipo', points: '10 pts por gol' },
  { label: 'Acertar la suma total de goles de la fase, prorroga incluida', points: '20 pts' },
];

const phaseCriteria: PhaseCriteria[] = [
  {
    title: 'Fase de grupos',
    description: 'Puntua cada partido de la fase inicial.',
    rules: [
      { label: 'Acertar el signo del partido (1-X-2)', points: '10 pts' },
      { label: 'Acertar el resultado exacto del partido', points: '15 pts' },
      { label: 'Acertar goles exactos de cada equipo', points: '10 pts por gol' },
    ],
  },
  {
    title: 'Dieciseisavos',
    description: 'Incluye bonus por clasificacion desde la fase de grupos.',
    rules: [
      { label: 'Acertar el primero de cada grupo', points: '10 pts por acierto' },
      { label: 'Acertar el segundo de cada grupo', points: '10 pts por acierto' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'Para puntuar el partido, debe estar acertado en el mismo orden del cuadro.',
  },
  {
    title: 'Octavos',
    description: 'Premia los equipos clasificados y los aciertos del partido.',
    rules: [
      { label: 'Acertar seleccion clasificada a octavos', points: '20 pts por acierto' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'Para puntuar el partido, debe estar acertado en el mismo orden del cuadro.',
  },
  {
    title: 'Cuartos',
    description: 'Mantiene los puntos por clasificados y resultados.',
    rules: [
      { label: 'Acertar seleccion clasificada a cuartos', points: '20 pts por acierto' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'Para puntuar el partido, debe estar acertado en el mismo orden del cuadro.',
  },
  {
    title: 'Semifinales',
    description: 'Sube el valor de acertar selecciones clasificadas.',
    rules: [
      { label: 'Acertar seleccion clasificada a semifinales', points: '40 pts por acierto' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'Para puntuar el partido, debe estar acertado en el mismo orden del cuadro.',
  },
  {
    title: 'Puestos 3o y 4o',
    description: 'Cuenta el partido y tambien acertar el puesto final.',
    rules: [
      { label: 'Acertar seleccion clasificada al partido por el tercer puesto', points: '40 pts por acierto' },
      { label: 'Acertar seleccion en el puesto 3o', points: '60 pts' },
      { label: 'Acertar seleccion en el puesto 4o', points: '45 pts' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'El orden de los equipos puede ser cualquiera, siempre que ambos jueguen este partido.',
  },
  {
    title: 'Final',
    description: 'Es la fase con mayor peso por acertar campeon y subcampeon.',
    rules: [
      { label: 'Acertar seleccion clasificada a la final', points: '50 pts por acierto' },
      { label: 'Acertar campeon del Mundial', points: '100 pts' },
      { label: 'Acertar subcampeon del Mundial', points: '75 pts' },
      { label: 'Aplican las reglas comunes de eliminatorias', points: 'Ver comunes' },
    ],
    note: 'El orden de los equipos puede ser cualquiera, siempre que ambos jueguen la final.',
  },
];

const tiebreakers = [
  'Haber acertado el campeon del Mundial.',
  'Haber acertado los dos equipos que llegan a la final.',
  'Haber acertado el subcampeon del Mundial.',
  'Haber acertado uno de los dos equipos clasificados para la final.',
  'Haber acertado el tercer clasificado del Mundial.',
  'Haber acertado los dos equipos que llegan al partido por el tercer puesto.',
  'Haber acertado el cuarto clasificado del Mundial.',
  'Haber acertado uno de los dos equipos clasificados para el partido por el tercer puesto.',
  'Mayor numero de partidos de fase de grupos con resultado exacto acertado.',
  'Mayor numero de partidos de fase de grupos con signo acertado (1-X-2).',
  'Mayor numero de paises clasificados a semifinales.',
  'Mayor numero de paises clasificados a cuartos.',
  'Mayor numero de paises clasificados a octavos.',
  'Haber acertado el numero total de goles en la final, prorroga incluida.',
  'Haber acertado el numero total de goles en el partido por el tercer puesto, prorroga incluida.',
  'Haber acertado el numero total de goles en semifinales, prorroga incluida.',
  'Haber acertado el numero total de goles en cuartos, prorroga incluida.',
  'Haber acertado el numero total de goles en octavos, prorroga incluida.',
  'Sorteo.',
];

function renderRule(rule: ScoringRule) {
  return (
    <li key={`${rule.label}-${rule.points ?? 'sin-puntos'}`} className="scoring-rule">
      <span>{rule.label}</span>
      {rule.points ? <strong className="scoring-points-badge">{rule.points}</strong> : null}
    </li>
  );
}

export function ScoringCriteriaPanel() {
  return (
    <div className="scoring-panel">
      <nav className="scoring-jump-links" aria-label="Navegacion de criterios">
        <a href="#criterios-resumen">Resumen</a>
        <a href="#criterios-comunes">Reglas comunes</a>
        <a href="#criterios-fases">Fases</a>
        <a href="#criterios-desempates">Desempates</a>
      </nav>

      <section id="criterios-resumen" className="scoring-section scoring-summary-section">
        <div className="scoring-section-heading">
          <span className="summary-label">Resumen clave</span>
          <h3>Criterios de puntuacion y desempate</h3>
        </div>
        <div className="scoring-summary-grid">
          {summaryItems.map((item) => (
            <article key={item} className="scoring-summary-card">
              {item}
            </article>
          ))}
        </div>
      </section>

      <section id="criterios-comunes" className="scoring-section">
        <div className="scoring-section-heading">
          <span className="summary-label">Reglas comunes</span>
          <h3>Partidos de eliminatorias</h3>
          <p>
            Estas reglas aplican a dieciseisavos, octavos, cuartos, semifinales, tercer puesto y final.
          </p>
        </div>
        <ul className="scoring-rule-list">{commonRules.map(renderRule)}</ul>
        <p className="scoring-important-note">
          Los marcadores se cuentan hasta la prorroga si existe. La tanda de penaltis no suma para el
          resultado ni para los goles totales.
        </p>
      </section>

      <section id="criterios-fases" className="scoring-section">
        <div className="scoring-section-heading">
          <span className="summary-label">Fases</span>
          <h3>Puntos por fase</h3>
        </div>
        <div className="scoring-phase-grid">
          {phaseCriteria.map((phase) => (
            <article key={phase.title} className="scoring-phase-card">
              <h4>{phase.title}</h4>
              <p>{phase.description}</p>
              <ul className="scoring-rule-list">{phase.rules.map(renderRule)}</ul>
              {phase.note ? <p className="scoring-phase-note">{phase.note}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="criterios-desempates" className="scoring-section">
        <div className="scoring-section-heading">
          <span className="summary-label">Desempates</span>
          <h3>Orden de prioridad</h3>
          <p>Si dos o mas participantes empatan a puntos, se aplica este orden.</p>
        </div>
        <ol className="scoring-tiebreaker-list">
          {tiebreakers.map((tiebreaker) => (
            <li key={tiebreaker}>{tiebreaker}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
