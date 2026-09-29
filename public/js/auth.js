import { isFirebaseConfigured, signInAdmin } from './firebase-config.js';

const form = document.querySelector('#login-form');
const message = document.querySelector('#login-message');
const submit = document.querySelector('#login-submit');

if (!isFirebaseConfigured()) {
	document.querySelector('#firebase-notice').hidden = false;
	submit.disabled = true;
}

form.addEventListener('submit', async event => {
	event.preventDefault();
	message.hidden = true;
	submit.disabled = true;
	submit.textContent = 'Verificando…';
	try {
		await signInAdmin(form.elements.email.value.trim(), form.elements.password.value);
		window.location.assign('dashboard.html');
	} catch (error) {
		message.textContent = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found'
			? 'El correo o la contraseña no son correctos.'
			: 'No se pudo iniciar sesión. Verificá la configuración y la conexión.';
		message.hidden = false;
	} finally {
		submit.disabled = !isFirebaseConfigured();
		submit.textContent = 'Ingresar al dashboard';
	}
});