import { calculateMetrics, percentage } from './analytics.js';
import { getSurveyResponses, isFirebaseConfigured, isFirebasePartiallyConfigured, observeAdmin, readLocalResponses, signOutAdmin } from './firebase-config.js';

const colors = ['#d9ae4d', '#d95650', '#4d9b70', '#e5d9b7', '#c77a47', '#75b5a0', '#aeb7ad', '#9b7b50'];
const demoMode = new URLSearchParams(location.search).get('demo') === '1';
const chartInstances = [];

function makeDemoRecords() {
	const gambling = ['Sí, actualmente', 'Sí, actualmente', 'Sí, pero actualmente no', 'No, nunca', 'No, nunca', 'Sí, actualmente', 'Sí, pero actualmente no'];
	const amounts = ['Menos de $5.000', '$5.000 - $10.000', '$10.001 - $25.000', '$25.001 - $50.000', '$50.001 - $100.000', 'Más de $100.000', 'Prefiero no responder'];
	const ages = [19, 22, 24, 27, 31, 36, 42, 51, 58, 66, 23, 29];
	const types = ['Casino online', 'Apuestas deportivas', 'Casino presencial', 'Juegos de cartas', 'Bingo', 'Apuestas en carreras', 'Juegos de azar'];
	const impacts = ['Economía personal', 'Estado de ánimo', 'Estudios', 'Relaciones familiares', 'Trabajo', 'Tiempo libre'];
	const topics = ['Cómo organizar un presupuesto', 'Cómo ahorrar', 'Riesgos de las apuestas', 'Cómo utilizar una tarjeta de crédito', 'Préstamos y endeudamiento', 'Probabilidad y juegos de azar'];
	return Array.from({ length: 84 }, (_, index) => {
		const state = gambling[index % gambling.length];
		const experienced = state !== 'No, nunca';
		return {
			edad: ages[index % ages.length],
			realiza_apuestas: state,
			frecuencia_apuestas: experienced ? ['Diariamente', 'Varias veces por semana', 'Una vez por semana', 'Algunas veces al mes', 'Menos de una vez al mes'][index % 5] : undefined,
			tipos_apuestas: experienced ? [types[index % types.length], types[(index + 2) % types.length]] : undefined,
			monto_mensual: experienced ? amounts[index % amounts.length] : undefined,
			excedio_presupuesto: experienced ? (index % 3 ? 'No' : 'Sí') : undefined,
			pidio_prestado: experienced ? (index % 4 ? 'No' : 'Sí') : undefined,
			aspectos_afectados: experienced ? (index % 5 ? [impacts[index % impacts.length], impacts[(index + 1) % impacts.length]] : ['Ninguno']) : undefined,
			interes_capacitacion: ['Sí', 'Sí', 'Tal vez', 'No'][index % 4],
			temas_capacitacion: [topics[index % topics.length], topics[(index + 2) % topics.length]],
			conocimiento_financiero: ['Sí, y podría explicarlo', 'Tengo una idea general', 'No', 'Nunca había escuchado el término'][index % 4],
			conciencia_riesgos: ['Sí', 'No', 'No estoy seguro/a'][index % 3],
			fechaEnvio: new Date(Date.UTC(2025, 0, 1 + index)).toISOString()
		};
	});
}

function formatNumber(value) {
	return new Intl.NumberFormat('es-AR').format(value);
}

function percentText(value) {
	return value === null ? 'Sin datos' : `${value}%`;
}

function renderKpis(metrics) {
	const items = [
		{ label: 'Respuestas recibidas', value: formatNumber(metrics.total), note: 'Total de participaciones' },
		{ label: 'Apuestas actualmente', value: percentText(metrics.activeRate), note: `De ${formatNumber(metrics.denominators.total)} respuestas` },
		{ label: 'Experiencia con apuestas', value: percentText(metrics.experienceRate), note: `Base: ${formatNumber(metrics.denominators.total)} personas` },
		{ label: 'Uso de deuda o crédito', value: percentText(metrics.debtRate), note: `Base válida: ${formatNumber(metrics.denominators.debt)} personas con experiencia` },
		{ label: 'Excedió el monto previsto', value: percentText(metrics.overspendRate), note: `Base válida: ${formatNumber(metrics.denominators.overspend)} personas con experiencia` },
		{ label: 'Reportó algún impacto', value: percentText(metrics.impactRate), note: `Base válida: ${formatNumber(metrics.denominators.impact)} personas con experiencia` },
		{ label: 'Interés en capacitación', value: percentText(metrics.trainingInterestRate), note: `Base válida: ${formatNumber(metrics.denominators.interest)} respuestas` }
	];
	document.querySelector('#kpi-grid').innerHTML = items.map((item, index) => `
		<article class="kpi-item"><span class="kpi-index">0${index + 1}</span><p>${item.label}</p><strong>${item.value}</strong><span class="kpi-note">${item.note}</span></article>`).join('');
}

function chartOptions({ horizontal = false, stacked = false } = {}) {
	return {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: horizontal ? 'y' : 'x',
		plugins: {
			legend: { display: false },
			tooltip: { backgroundColor: '#18221c', titleColor: '#f7f1df', bodyColor: '#d0d0c4', padding: 12, displayColors: false }
		},
		scales: {
			x: { beginAtZero: true, stacked, grid: { color: 'rgba(64, 80, 68, .42)' }, ticks: { color: '#a0aa9f', precision: 0 } },
			y: { beginAtZero: true, stacked, grid: { display: false }, ticks: { color: '#d0d0c4', autoSkip: false } }
		}
	};
}

function drawChart(Chart, id, data, type, options = {}) {
	const canvas = document.querySelector(`#${id}`);
	const empty = canvas.parentElement.querySelector('.chart-empty');
	const hasData = data.labels.length > 0 && data.values.some(value => value > 0);
	canvas.hidden = !hasData;
	empty.hidden = hasData;
	if (!hasData) return;
	const isDoughnut = type === 'doughnut';
	chartInstances.push(new Chart(canvas, {
		type,
		data: { labels: data.labels, datasets: [{ data: data.values, backgroundColor: isDoughnut ? colors : colors[0], borderColor: isDoughnut ? '#18221c' : colors[0], borderWidth: isDoughnut ? 3 : 0, borderRadius: isDoughnut ? 0 : 3, maxBarThickness: 28 }] },
		options: isDoughnut ? {
			responsive: true,
			maintainAspectRatio: false,
			cutout: '68%',
			plugins: { legend: { position: 'bottom', labels: { color: '#d0d0c4', usePointStyle: true, pointStyle: 'circle', padding: 18, boxWidth: 8 } }, tooltip: chartOptions().plugins.tooltip }
		} : chartOptions(options)
	}));
}

function renderTable(records, metrics) {
	const counts = new Map();
	records.forEach(record => {
		if (record.realiza_apuestas === 'No, nunca') return;
		const value = record.monto_mensual;
		if (typeof value !== 'string' || !value.trim()) return;
		counts.set(value, (counts.get(value) || 0) + 1);
	});
	const rows = [...counts.entries()].sort((first, second) => second[1] - first[1]);
	const body = document.querySelector('#spend-table');
	document.querySelector('#spend-empty').hidden = rows.length > 0;
	body.innerHTML = rows.map(([label, count]) => `<tr><th scope="row">${label}</th><td>${formatNumber(count)}</td><td>${percentText(percentage(count, metrics.denominators.experienced))}</td></tr>`).join('');
}

async function render(records, Chart) {
	const metrics = calculateMetrics(records);
	renderKpis(metrics);
	drawChart(Chart, 'gambling-chart', { labels: metrics.gamblingStates.map(item => item[0]), values: metrics.gamblingStates.map(item => item[1]) }, 'doughnut');
	drawChart(Chart, 'age-chart', { labels: metrics.ages.map(item => item[0]), values: metrics.ages.map(item => item[1]) }, 'bar');
	drawChart(Chart, 'frequency-chart', { labels: metrics.frequency.map(item => item[0]), values: metrics.frequency.map(item => item[1]) }, 'bar', { horizontal: true });
	const impactRows = metrics.impacts.filter(([label]) => label !== 'Ninguno');
	drawChart(Chart, 'impact-chart', { labels: impactRows.map(item => item[0]), values: impactRows.map(item => item[1]) }, 'bar', { horizontal: true });
	drawChart(Chart, 'topics-chart', { labels: metrics.trainingTopics.slice(0, 8).map(item => item[0]), values: metrics.trainingTopics.slice(0, 8).map(item => item[1]) }, 'bar', { horizontal: true });
	drawChart(Chart, 'awareness-chart', { labels: metrics.awareness.map(item => item[0]), values: metrics.awareness.map(item => item[1]) }, 'doughnut');
	renderTable(records, metrics);
	document.querySelector('#updated-at').textContent = records.length ? `${formatNumber(records.length)} registros` : 'Aún no hay respuestas';
}

async function initialize() {
	const demoNotice = document.querySelector('#demo-notice');
	const localNotice = document.querySelector('#local-notice');
	const badge = document.querySelector('#data-badge');
	const logout = document.querySelector('#logout-button');
	const { default: Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/auto/+esm');

	if (demoMode) {
		demoNotice.hidden = false;
		badge.textContent = 'Demostración';
		await render(makeDemoRecords(), Chart);
		return;
	}

	if (isFirebasePartiallyConfigured()) {
		badge.textContent = 'Configuración incompleta';
		const error = document.querySelector('#dashboard-error');
		error.textContent = 'Completá todos los valores de Firebase en firebase-config.js para cargar la base de datos.';
		error.hidden = false;
		await render([], Chart);
		return;
	}

	if (isFirebaseConfigured()) {
		logout.hidden = false;
		const stopObserving = await observeAdmin(async user => {
			if (!user) {
				window.location.replace('login.html');
				return;
			}
			try {
				badge.textContent = 'Firebase';
				await render(await getSurveyResponses(), Chart);
			} catch (error) {
				document.querySelector('#dashboard-error').textContent = 'No fue posible cargar las respuestas. Revisá las reglas de acceso a Firestore.';
				document.querySelector('#dashboard-error').hidden = false;
				console.error('No se pudieron cargar las respuestas:', error);
			}
		});
		window.addEventListener('pagehide', stopObserving, { once: true });
		logout.addEventListener('click', async () => {
			await signOutAdmin();
			window.location.assign('login.html');
		});
		return;
	}

	const records = readLocalResponses();
	if (records.length) {
		localNotice.hidden = false;
		badge.textContent = 'Almacenamiento local';
	} else {
		badge.textContent = 'Sin conexión a Firebase';
	}
	await render(records, Chart);
}

initialize().catch(error => {
	document.querySelector('#dashboard-error').textContent = 'No se pudo inicializar el dashboard. Verificá la conexión a internet.';
	document.querySelector('#dashboard-error').hidden = false;
	console.error('No se pudo iniciar el dashboard:', error);
});