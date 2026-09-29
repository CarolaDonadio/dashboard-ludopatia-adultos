export const GAMBLING_STATES = [
  'Sí, actualmente',
  'Sí, pero actualmente no',
  'No, nunca'
];

export const hasGamblingExperience = record =>
  GAMBLING_STATES.slice(0, 2).includes(record.realiza_apuestas);

export function percentage(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 100) : null;
}

export function listValue(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' && item.trim());
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export function countAnswers(records, field, eligible = () => true) {
  const counts = new Map();
  records.forEach(record => {
    if (!eligible(record)) return;
    listValue(record[field]).forEach(answer => {
      const normalized = answer.startsWith('Otro:') ? 'Otro' : answer;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((first, second) => second[1] - first[1]);
}

export function countSingleAnswers(records, field, eligible = () => true) {
  const counts = new Map();
  records.forEach(record => {
    const answer = record[field];
    if (!eligible(record) || typeof answer !== 'string' || !answer.trim()) return;
    counts.set(answer, (counts.get(answer) || 0) + 1);
  });
  return [...counts.entries()].sort((first, second) => second[1] - first[1]);
}

export function ageDistribution(records) {
  const bands = [
    ['18–24', age => age <= 24],
    ['25–34', age => age >= 25 && age <= 34],
    ['35–44', age => age >= 35 && age <= 44],
    ['45–54', age => age >= 45 && age <= 54],
    ['55+', age => age >= 55]
  ];
  const validAges = records.map(record => Number(record.edad)).filter(age =>
    Number.isInteger(age) && age >= 18 && age <= 100
  );
  return bands.map(([label, matches]) => [label, validAges.filter(matches).length]);
}

export function calculateMetrics(input) {
  const records = Array.isArray(input) ? input : [];
  const total = records.length;
  const experienced = records.filter(hasGamblingExperience);
  const neverBet = records.filter(record => record.realiza_apuestas === 'No, nunca');
  const validDebt = experienced.filter(record => ['Sí', 'No'].includes(record.pidio_prestado));
  const validImpact = experienced.filter(record => listValue(record.aspectos_afectados).length > 0);
  const validInterest = records.filter(record => ['Sí', 'No', 'Tal vez'].includes(record.interes_capacitacion));
  const spendAnswers = experienced
    .map(record => record.monto_mensual)
    .filter(value => typeof value === 'string' && value && value !== 'N/A' && value !== 'Prefiero no responder');
  const spendCounts = new Map();
  spendAnswers.forEach(value => spendCounts.set(value, (spendCounts.get(value) || 0) + 1));
  const topSpend = [...spendCounts.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] || null;
  const affected = validImpact.filter(record =>
    listValue(record.aspectos_afectados).some(answer => answer !== 'Ninguno')
  );
  const validOverspend = experienced.filter(record => ['Sí', 'No'].includes(record.excedio_presupuesto));
  const validAwareness = records.filter(record => ['Sí', 'No', 'No estoy seguro/a'].includes(record.conciencia_riesgos));
  const neverBetPerceptionFields = [
    ['Afectación cotidiana', 'afectacion_cotidiana'],
    ['Más consecuencias negativas', 'consecuencias_negativas'],
    ['Puede generar adicción', 'puede_generar_adiccion'],
    ['Conoce a alguien afectado', 'conoce_persona_adiccion']
  ];

  return {
    total,
    activeRate: percentage(records.filter(record => record.realiza_apuestas === 'Sí, actualmente').length, total),
    experienceRate: percentage(experienced.length, total),
    debtRate: percentage(validDebt.filter(record => record.pidio_prestado === 'Sí').length, validDebt.length),
    impactRate: percentage(affected.length, validImpact.length),
    trainingInterestRate: percentage(validInterest.filter(record => record.interes_capacitacion === 'Sí').length, validInterest.length),
    overspendRate: percentage(validOverspend.filter(record => record.excedio_presupuesto === 'Sí').length, validOverspend.length),
    neverBet,
    topSpend,
    gamblingStates: countSingleAnswers(records, 'realiza_apuestas'),
    frequency: countSingleAnswers(records, 'frecuencia_apuestas', hasGamblingExperience),
    betTypes: countAnswers(records, 'tipos_apuestas', hasGamblingExperience),
    bettingMotives: countAnswers(records, 'motivos_apuestas', hasGamblingExperience),
    fundingSources: countAnswers(records, 'origen_dinero', hasGamblingExperience),
    reductionAttempts: countSingleAnswers(records, 'intento_reducir', hasGamblingExperience),
    reductionOutcomes: countSingleAnswers(records, 'mantuvo_reduccion', record => hasGamblingExperience(record) && record.intento_reducir === 'Sí'),
    impacts: countAnswers(records, 'aspectos_afectados', hasGamblingExperience),
    financialEducation: countSingleAnswers(records, 'conocimiento_financiero'),
    financialEducationHistory: countAnswers(records, 'educacion_financiera_previa'),
    trainingTopics: countAnswers(records, 'temas_capacitacion'),
    ages: ageDistribution(records),
    awareness: countSingleAnswers(records, 'conciencia_riesgos'),
    advertising: countSingleAnswers(records, 'publicidad_apuestas'),
    legalKnowledge: countSingleAnswers(records, 'legalidad_plataforma'),
    neverBetReasons: countAnswers(records, 'motivos_no_apuesta', record => record.realiza_apuestas === 'No, nunca'),
    neverBetPerceptions: neverBetPerceptionFields.map(([label, field]) => {
      const answers = countSingleAnswers(neverBet, field);
      const validAnswers = answers.reduce((sum, [, count]) => sum + count, 0);
      const yesAnswers = answers.find(([answer]) => answer === 'Sí')?.[1] || 0;
      return [label, percentage(yesAnswers, validAnswers)];
    }),
    denominators: {
      total,
      experienced: experienced.length,
      neverBet: neverBet.length,
      debt: validDebt.length,
      impact: validImpact.length,
      interest: validInterest.length,
      overspend: validOverspend.length,
      spend: spendAnswers.length,
      awareness: validAwareness.length
    }
  };
}
