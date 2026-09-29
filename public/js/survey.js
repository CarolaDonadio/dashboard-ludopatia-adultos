import { saveSurveyResponse } from './firebase-config.js';

const optionSets = {
  carrera: ['Administración Financiera', 'Base de Datos e Inteligencia Artificial', 'Profesorado de Educación Inicial', 'Profesorado de Inglés', 'Profesorado de Matemática', 'Profesorado en Lengua y Literatura', 'Curso de Formación Básica de Inglés', 'Enfermería', 'Trabajo Social', 'Seguridad e Higiene', 'Otra'],
  genero: ['Femenino', 'Masculino', 'Otro'],
  situacion_laboral: ['Trabajo en relación de dependencia', 'Trabajo por cuenta propia', 'Trabajo y estudio', 'No trabajo actualmente', 'Otra situación'],
  dependencia_economica: ['Sí', 'No', 'Parcialmente'],
  tiene_dependientes: ['Sí', 'No'],
  realiza_apuestas: ['Sí, actualmente', 'Sí, pero actualmente no', 'No, nunca'],
  frecuencia_apuestas: ['Diariamente', 'Varias veces por semana', 'Una vez por semana', 'Algunas veces al mes', 'Menos de una vez al mes'],
  tipos_apuestas: ['Casino online', 'Apuestas deportivas', 'Casino presencial', 'Juegos de cartas', 'Bingo', 'Apuestas en carreras', 'Juegos de azar', 'Otra'],
  motivos_apuestas: ['Entretenimiento/diversión', 'Posibilidad de ganar dinero', 'Influencia de amigos o conocidos', 'Publicidad/redes sociales', 'Curiosidad', 'Costumbre', 'Otro'],
  monto_mensual: ['Menos de $5.000', '$5.000 - $10.000', '$10.001 - $25.000', '$25.001 - $50.000', '$50.001 - $100.000', 'Más de $100.000', 'Prefiero no responder'],
  origen_dinero: ['Ingresos de mi trabajo', 'Dinero que recibo de mi familia', 'Ahorros', 'Dinero prestado', 'Crédito/tarjeta', 'Otro'],
  excedio_presupuesto: ['Sí', 'No'],
  pidio_prestado: ['Sí', 'No', 'Prefiero no responder'],
  intento_reducir: ['Sí', 'No'],
  mantuvo_reduccion: ['Sí', 'No', 'Parcialmente'],
  aspectos_afectados: ['Economía personal', 'Estudios', 'Trabajo', 'Relaciones familiares', 'Relaciones con amigos', 'Tiempo libre', 'Estado de ánimo', 'Ninguno'],
  publicidad_apuestas: ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Muy frecuentemente'],
  legalidad_plataforma: ['Sí', 'No', 'No estoy seguro/a'],
  motivos_no_apuesta: ['Falta de conocimiento', 'Miedo', 'Falta de dinero', 'Otros'],
  afectacion_cotidiana: ['Sí', 'No'],
  consecuencias_negativas: ['Sí', 'No'],
  puede_generar_adiccion: ['Sí', 'No'],
  conoce_persona_adiccion: ['Sí', 'No'],
  conocimiento_financiero: ['Sí, y podría explicarlo', 'Tengo una idea general', 'No', 'Nunca había escuchado el término'],
  educacion_financiera_previa: ['Sí, en la escuela', 'Sí, en un curso/taller', 'Sí, en mi carrera', 'Sí, a través de mi familia', 'Sí, por mi cuenta', 'No', 'No recuerdo'],
  interes_capacitacion: ['Sí', 'No', 'Tal vez'],
  temas_capacitacion: ['Cómo organizar un presupuesto', 'Cómo ahorrar', 'Cómo utilizar una tarjeta de crédito', 'Préstamos y endeudamiento', 'Inversiones', 'Intereses', 'Inflación', 'Riesgos de las apuestas', 'Probabilidad y juegos de azar', 'Otro'],
  conciencia_riesgos: ['Sí', 'No', 'No estoy seguro/a']
};

const sections = [
  { title: 'Datos demográficos y socioeconómicos', questions: [
    { name: 'edad', label: '¿Qué edad tenés?', type: 'number', min: 18, max: 100, required: true },
    { name: 'carrera', label: '¿Qué carrera estás cursando?', type: 'select', options: 'carrera', other: true, required: true },
    { name: 'genero', label: '¿Con qué género te identificás?', type: 'select', options: 'genero', other: true, required: true },
    { name: 'situacion_laboral', label: '¿Cuál es tu situación laboral actual?', type: 'checkbox', options: 'situacion_laboral', other: true, required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'dependencia_economica', label: '¿Dependés económicamente de otra persona?', type: 'radio', options: 'dependencia_economica', required: true },
    { name: 'tiene_dependientes', label: '¿Hay alguna persona que dependa económicamente de vos?', type: 'radio', options: 'tiene_dependientes', required: true }
  ] },
  { title: 'Hábitos generales de apuestas', questions: [
    { name: 'realiza_apuestas', label: '¿Realizás o realizaste apuestas con dinero?', type: 'radio', options: 'realiza_apuestas', required: true }
  ] },
  { title: 'Hábitos de apuestas', condition: 'experienced', questions: [
    { name: 'frecuencia_apuestas', label: '¿Con qué frecuencia realizás o realizabas apuestas?', type: 'radio', options: 'frecuencia_apuestas', required: true },
    { name: 'tipos_apuestas', label: '¿Qué tipo de apuestas realizás o realizaste?', type: 'checkbox', options: 'tipos_apuestas', other: true, required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'motivos_apuestas', label: '¿Cuáles son los principales motivos por los que apostás o apostabas?', type: 'checkbox', options: 'motivos_apuestas', other: true, required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'monto_mensual', label: 'Aproximadamente, ¿cuánto dinero destinás a apuestas en un mes?', type: 'radio', options: 'monto_mensual', required: true },
    { name: 'origen_dinero', label: '¿De dónde proviene principalmente el dinero que utilizás para apostar?', type: 'checkbox', options: 'origen_dinero', other: true, required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'excedio_presupuesto', label: '¿Alguna vez apostaste más dinero del que inicialmente tenías pensado gastar?', type: 'radio', options: 'excedio_presupuesto', required: true },
    { name: 'pidio_prestado', label: '¿Alguna vez pediste dinero prestado o utilizaste crédito para apostar?', type: 'radio', options: 'pidio_prestado', required: true },
    { name: 'intento_reducir', label: '¿Alguna vez intentaste dejar de apostar o reducir la cantidad de apuestas?', type: 'radio', options: 'intento_reducir', required: true },
    { name: 'mantuvo_reduccion', label: 'Si respondiste que sí, ¿lograste mantener esa decisión?', type: 'radio', options: 'mantuvo_reduccion', required: true, revealIf: ['intento_reducir', 'Sí'] },
    { name: 'aspectos_afectados', label: '¿Las apuestas alguna vez afectaron alguno de estos aspectos de tu vida?', type: 'checkbox', options: 'aspectos_afectados', required: true, hint: 'Podés seleccionar más de una. “Ninguno” es excluyente.' }
  ] },
  { title: 'Exposición a publicidad y legalidad', questions: [
    { name: 'publicidad_apuestas', label: '¿Con qué frecuencia ves publicidad relacionada con apuestas?', type: 'radio', options: 'publicidad_apuestas', required: true },
    { name: 'legalidad_plataforma', label: '¿Sabés cómo identificar si una plataforma de apuestas está habilitada legalmente?', type: 'radio', options: 'legalidad_plataforma', required: true }
  ] },
  { title: 'Percepción sobre apuestas', condition: 'never', questions: [
    { name: 'motivos_no_apuesta', label: '¿Por qué no apostás?', type: 'checkbox', options: 'motivos_no_apuesta', other: true, required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'afectacion_cotidiana', label: '¿Pensás que las apuestas pueden afectar tu vida cotidiana?', type: 'radio', options: 'afectacion_cotidiana', required: true },
    { name: 'consecuencias_negativas', label: '¿Creés que las apuestas tienen más consecuencias negativas que positivas?', type: 'radio', options: 'consecuencias_negativas', required: true },
    { name: 'puede_generar_adiccion', label: '¿Considerás que las apuestas pueden generar adicción?', type: 'radio', options: 'puede_generar_adiccion', required: true },
    { name: 'conoce_persona_adiccion', label: '¿Conocés a alguien que tenga una adicción a las apuestas?', type: 'radio', options: 'conoce_persona_adiccion', required: true }
  ] },
  { title: 'Educación financiera', questions: [
    { name: 'conocimiento_financiero', label: '¿Sabés qué significa “educación financiera”?', type: 'radio', options: 'conocimiento_financiero', required: true },
    { name: 'educacion_financiera_previa', label: '¿Recibiste educación financiera anteriormente?', type: 'checkbox', options: 'educacion_financiera_previa', required: true, hint: 'Podés seleccionar más de una.' },
    { name: 'interes_capacitacion', label: '¿Te gustaría recibir más información o capacitación sobre educación financiera?', type: 'radio', options: 'interes_capacitacion', required: true },
    { name: 'temas_capacitacion', label: '¿Sobre qué temas te gustaría aprender?', type: 'checkbox', options: 'temas_capacitacion', other: true, required: true, hint: 'Podés seleccionar más de una.' }
  ] },
  { title: 'Conclusión', questions: [
    { name: 'conciencia_riesgos', label: 'Después de responder esta encuesta, ¿considerás que tenés una mayor conciencia sobre los riesgos económicos asociados a las apuestas?', type: 'radio', options: 'conciencia_riesgos', required: true }
  ] }
];

const sectionHost = document.querySelector('#survey-sections');
const form = document.querySelector('#survey-form');
const formPanel = document.querySelector('#form-panel');
const welcomePanel = document.querySelector('#welcome-panel');
const formMessage = document.querySelector('#form-message');
const progressBar = document.querySelector('#progress-bar');
const progressTrack = document.querySelector('.progress-track');
const dialog = document.querySelector('#thanks-dialog');
const experienced = ['Sí, actualmente', 'Sí, pero actualmente no'];
let activeSectionIndex = 0;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderChoices(question, sectionIndex) {
  const options = optionSets[question.options];
  const inputType = question.type === 'checkbox' ? 'checkbox' : 'radio';
  const otherOption = question.other ? options.find(option => ['Otra', 'Otra situación', 'Otro', 'Otros'].includes(option)) : null;
  const standardOptions = otherOption ? options.filter(option => option !== otherOption) : options;
  const choices = standardOptions.map((option, optionIndex) => `
    <label class="choice-option"><input type="${inputType}" name="${question.name}" value="${escapeHtml(option)}" ${question.required ? 'required' : ''}><span>${escapeHtml(option)}</span></label>`).join('');
  const other = otherOption ? `
    <label class="choice-option other-choice"><input type="${inputType}" name="${question.name}" value="${escapeHtml(otherOption)}" ${question.required ? 'required' : ''}><span>${escapeHtml(otherOption)}</span></label>
    <input class="other-input" name="${question.name}_otro" type="text" maxlength="120" placeholder="Especificá tu respuesta" aria-label="Especificá ${escapeHtml(otherOption.toLowerCase())}" hidden>` : '';
  return `<div class="choice-list ${inputType === 'checkbox' ? 'choice-grid' : ''}" data-question="${question.name}" data-type="${inputType}" data-option-count="${standardOptions.length + (otherOption ? 1 : 0)}">${choices}${other}</div>`;
}

function renderQuestion(question, sectionIndex) {
  const requiredMark = question.required ? '<span class="required-mark">*</span>' : '';
  const hint = question.hint ? `<span class="question-hint">${question.hint}</span>` : '';
  const input = question.type === 'number'
    ? `<input class="text-input" name="${question.name}" type="number" inputmode="numeric" min="${question.min}" max="${question.max}" placeholder="Ej. 24" required>`
    : question.type === 'select'
      ? `<select class="text-input" name="${question.name}" required><option value="" disabled selected>Elegí una opción</option>${optionSets[question.options].map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}</select>${question.other ? `<input class="other-input select-other" name="${question.name}_otro" type="text" maxlength="120" placeholder="Especificá otra opción" hidden>` : ''}`
      : renderChoices(question, sectionIndex);
  return `<fieldset class="question" data-question-name="${question.name}" data-required="${question.required}" ${question.revealIf ? `data-reveal-if="${question.revealIf.join('|')}" hidden` : ''}><legend>${question.label} ${requiredMark}</legend>${hint}${input}<span class="field-error" aria-live="polite"></span></fieldset>`;
}

sectionHost.innerHTML = sections.map((section, index) => `
  <section class="question-section" data-section="${index}" ${section.condition ? `data-condition="${section.condition}"` : ''}>
    <div class="section-title"><span class="section-number">${String(index + 1).padStart(2, '0')}</span><div><p class="eyebrow">Sección ${index + 1}</p><h2>${section.title}</h2></div></div>
    ${section.questions.map(question => renderQuestion(question, index)).join('')}
  </section>`).join('');

const allQuestions = sections.flatMap(section => section.questions);
function selectedValue(name) {
  const selected = [...form.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value);
  return selected.length ? selected[0] : '';
}

function isVisibleQuestion(fieldset) {
  if (fieldset.hidden) return false;
  const section = fieldset.closest('[data-condition]');
  if (!section) return true;
  const answer = selectedValue('realiza_apuestas');
  return section.dataset.condition === 'experienced' ? experienced.includes(answer) : answer === 'No, nunca';
}

function updateBranches() {
  const answer = selectedValue('realiza_apuestas');
  document.querySelectorAll('[data-condition="experienced"]').forEach(section => {
    section.hidden = !experienced.includes(answer);
  });
  document.querySelectorAll('[data-condition="never"]').forEach(section => {
    section.hidden = answer !== 'No, nunca';
  });
  document.querySelectorAll('[data-reveal-if]').forEach(fieldset => {
    const [name, value] = fieldset.dataset.revealIf.split('|');
    fieldset.hidden = selectedValue(name) !== value;
  });
  const impactInputs = form.querySelectorAll('[name="aspectos_afectados"]');
  const noneInput = [...impactInputs].find(input => input.value === 'Ninguno');
  impactInputs.forEach(input => {
    if (input.value !== 'Ninguno') input.disabled = Boolean(noneInput?.checked);
  });
  const visibleQuestions = [...form.querySelectorAll('.question')].filter(isVisibleQuestion);
  const answered = visibleQuestions.filter(fieldset => {
    const name = fieldset.dataset.questionName;
    if (name === 'edad' || fieldset.querySelector('select')) {
      const value = form.elements[name]?.value;
      if (name === 'carrera' || name === 'genero') return Boolean(value && (value !== 'Otra' && value !== 'Otro' || form.elements[`${name}_otro`]?.value.trim()));
      return Boolean(value);
    }
    const selected = [...form.querySelectorAll(`[name="${name}"]:checked`)];
    if (!selected.length) return false;
    const otherSelected = selected.some(input => ['Otra', 'Otra situación', 'Otro', 'Otros'].includes(input.value));
    return !otherSelected || Boolean(form.elements[`${name}_otro`]?.value.trim());
  }).length;
  const applicable = visibleQuestions.length;
  const step = activeSectionIndex + 1;
  document.querySelector('#progress-label').textContent = `Sección ${step} de 7`;
  document.querySelector('#progress-count').textContent = `${answered} de ${applicable} respuestas`;
  progressBar.style.width = `${applicable ? Math.min(100, Math.round(answered / applicable * 100)) : 0}%`;
  progressTrack.setAttribute('aria-valuemax', String(applicable));
  progressTrack.setAttribute('aria-valuenow', String(answered));
}

function updateOtherFields(target) {
  if (target.name === 'carrera' || target.name === 'genero') {
    const input = form.elements[`${target.name}_otro`];
    if (input) {
      input.hidden = target.value !== 'Otra' && target.value !== 'Otro';
      input.required = !input.hidden;
    }
  }
  if (target.type === 'radio' || target.type === 'checkbox') {
    const group = [...form.querySelectorAll(`[name="${target.name}"]`)];
    const otherSelected = group.some(input => input.checked && ['Otra', 'Otra situación', 'Otro', 'Otros'].includes(input.value));
    const otherInput = form.elements[`${target.name}_otro`];
    if (otherInput) {
      otherInput.hidden = !otherSelected;
      otherInput.required = otherSelected;
      if (!otherSelected) otherInput.value = '';
    }
    if (target.name === 'aspectos_afectados' && target.checked && target.value === 'Ninguno') {
      group.forEach(input => { if (input.value !== 'Ninguno') input.checked = false; });
    }
  }
}

function validateForm() {
  let firstInvalid = null;
  document.querySelectorAll('.question').forEach(fieldset => {
    const error = fieldset.querySelector('.field-error');
    error.textContent = '';
    if (!isVisibleQuestion(fieldset) || fieldset.dataset.required !== 'true') return;
    const name = fieldset.dataset.questionName;
    let valid;
    if (name === 'edad') {
      const age = Number(form.elements.edad.value);
      valid = Number.isInteger(age) && age >= 18 && age <= 100;
    } else if (fieldset.querySelector('select')) {
      valid = Boolean(form.elements[name].value);
      const otherInput = form.elements[`${name}_otro`];
      if ((form.elements[name].value === 'Otra' || form.elements[name].value === 'Otro') && !otherInput.value.trim()) valid = false;
    } else {
      const selected = [...form.querySelectorAll(`[name="${name}"]:checked`)];
      valid = selected.length > 0;
      const otherSelected = selected.some(input => ['Otra', 'Otra situación', 'Otro', 'Otros'].includes(input.value));
      if (otherSelected && !form.elements[`${name}_otro`]?.value.trim()) valid = false;
      if (name === 'aspectos_afectados' && selected.some(input => input.value === 'Ninguno') && selected.length > 1) valid = false;
    }
    if (!valid) {
      error.textContent = name === 'edad' ? 'Ingresá una edad válida entre 18 y 100.' : 'Completá esta respuesta para continuar.';
      firstInvalid ||= fieldset;
    }
  });
  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalid.querySelector('input:not([type="checkbox"]):not([type="radio"]), select, input[type="radio"], input[type="checkbox"]')?.focus({ preventScroll: true });
    return false;
  }
  return true;
}

function collectAnswers() {
  const answers = {};
  allQuestions.forEach(question => {
    const fieldset = form.querySelector(`[data-question-name="${question.name}"]`);
    if (fieldset && !isVisibleQuestion(fieldset)) return;
    if (question.name === 'edad') {
      answers.edad = Number(form.elements.edad.value);
      return;
    }
    if (form.querySelector(`select[name="${question.name}"]`)) {
      let value = form.elements[question.name].value;
      const other = form.elements[`${question.name}_otro`];
      if (other && !other.hidden && other.value.trim()) value = `${value}: ${other.value.trim()}`;
      answers[question.name] = value;
      return;
    }
    const selected = [...form.querySelectorAll(`[name="${question.name}"]:checked`)].map(input => {
      const other = form.elements[`${question.name}_otro`];
      return other && !other.hidden && other.value.trim() && ['Otra', 'Otra situación', 'Otro', 'Otros'].includes(input.value)
        ? `${input.value}: ${other.value.trim()}`
        : input.value;
    });
    answers[question.name] = form.querySelector(`[name="${question.name}"][type="checkbox"]`) ? selected : (selected[0] || '');
  });
  return answers;
}

document.querySelector('#start-survey').addEventListener('click', () => {
  welcomePanel.hidden = true;
  formPanel.hidden = false;
  form.querySelector('input')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('#back-to-welcome').addEventListener('click', () => {
  formPanel.hidden = true;
  welcomePanel.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

form.addEventListener('change', event => {
  const questionSection = event.target.closest('.question-section');
  if (questionSection) activeSectionIndex = Number(questionSection.dataset.section || 0);
  updateOtherFields(event.target);
  updateBranches();
});
form.addEventListener('focusin', event => {
  const questionSection = event.target.closest('.question-section');
  if (questionSection) {
    activeSectionIndex = Number(questionSection.dataset.section || 0);
    updateBranches();
  }
});
form.addEventListener('input', updateBranches);

form.addEventListener('submit', async event => {
  event.preventDefault();
  formMessage.hidden = true;
  if (!validateForm()) return;
  const submitButton = document.querySelector('#submit-survey');
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  try {
    await saveSurveyResponse(collectAnswers());
    dialog.showModal();
  } catch (error) {
    formMessage.textContent = error.message.includes('configuración de Firebase')
      ? 'La encuesta todavía no está conectada a la base de datos. Avisale al equipo administrador.'
      : 'No pudimos registrar la respuesta. Revisá tu conexión e intentá nuevamente.';
    formMessage.hidden = false;
    console.error('No se pudo enviar la encuesta:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar respuestas <span aria-hidden="true">→</span>';
  }
});

function closeThanks() {
  dialog.close();
  form.reset();
  document.querySelectorAll('.other-input').forEach(input => { input.hidden = true; input.required = false; });
  activeSectionIndex = 0;
  formPanel.hidden = true;
  welcomePanel.hidden = false;
  updateBranches();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelector('#close-thanks').addEventListener('click', closeThanks);
document.querySelector('#finish-thanks').addEventListener('click', closeThanks);
updateBranches();