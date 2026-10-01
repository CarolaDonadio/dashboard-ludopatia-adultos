# LudoStats: apuestas y educación financiera

Encuesta anónima para personas adultas y dashboard descriptivo. Sitio estático construido con HTML, CSS y JavaScript; Firebase es opcional durante el desarrollo y Vercel puede publicar el directorio `public`.

## Páginas

- `/` presenta el estudio.
- `/encuesta` contiene las 29 preguntas, sus ramificaciones y el agradecimiento al enviar.
- `/login` autentica al equipo administrador con Firebase Authentication.
- `/dashboard` muestra respuestas locales si Firebase aún no está configurado o datos de Firestore con sesión válida.
- `/dashboard?demo=1` muestra datos sintéticos, siempre identificados como demostración.
- El botón **Descargar Excel** exporta indicadores, distribuciones y respuestas en un archivo `.xlsx`.

## Desarrollo local

Serví `public` con cualquier servidor HTTP estático. No abras las páginas con `file://`: los módulos JavaScript y las importaciones de Firebase requieren HTTP/HTTPS.

Mientras `firebase-config.js` tenga valores de ejemplo, las respuestas se guardan en `localStorage` del navegador actual. Ese almacenamiento es solo para desarrollo, no sincroniza dispositivos ni constituye un almacén seguro. El acceso al dashboard local no está protegido.

## Crear y conectar Firestore

Firestore es una base documental: no hace falta crear una tabla ni una colección de respuestas manualmente. Al enviar la primera encuesta, `addDoc` crea `respuestas_encuesta` y un documento nuevo con ID automático.

1. En Firebase Console, creá un proyecto o abrí el existente.
2. En **Configuración del proyecto > General**, registrá una aplicación web. Copiá su objeto `firebaseConfig` en `public/js/firebase-config.js`, reemplazando `apiKey`, `authDomain`, `projectId`, `messagingSenderId` y `appId`.
3. En **Compilación > Firestore Database**, elegí **Crear base de datos** y **modo de producción**. Elegí con cuidado la ubicación/región: Firestore no permite cambiarla después de crear la base.
4. En la pestaña **Reglas**, pegá el contenido de `firestore.secure.rules` y publicalo. Firebase Hosting también está configurado para usar ese archivo. Las reglas permiten crear respuestas anónimas validadas y limitan la lectura a la cuenta cuya UID está indicada en esas reglas.
5. Habilitá **Authentication > Proveedores de acceso > Correo electrónico/contraseña** y creá la cuenta que administrará el dashboard.
6. Agregá a Authentication los dominios donde se publica el sitio, incluidos los dominios de producción de Vercel y el dominio personalizado si existe. Cuando esté publicada la web, enviá una respuesta de prueba: debe aparecer `respuestas_encuesta` en **Firestore > Datos**. Iniciá sesión con la cuenta cuya UID coincide con la indicada en `firestore.secure.rules`.

La colección usada es `respuestas_encuesta`; cada documento incluye `fechaEnvio` (timestamp del servidor), respuestas de texto y arreglos para preguntas múltiples. Las respuestas omitidas por ramificación no se guardan como campos vacíos. Los valores “Otro” se guardan junto a la opción (por ejemplo, `Otro: respuesta`). El panel consulta por `fechaEnvio` y calcula sus KPI y gráficos en el navegador; la consulta de un solo campo no necesita índice compuesto.

La configuración Firebase web identifica el proyecto, pero no es una contraseña. La protección de lectura depende de publicar las reglas con la UID autorizada correcta. Antes de recolectar respuestas reales, revisá cuotas, privacidad/consentimiento, App Check y protección contra envíos abusivos.

## Métricas

Los indicadores de deuda, exceso del presupuesto e impacto usan solo respuestas válidas de quienes apostaron actualmente o en el pasado. Interés de capacitación y conciencia general usan sus respuestas válidas. Las preguntas multiselección cuentan personas por opción y no son porcentajes mutuamente excluyentes. Las bases de cada KPI se muestran debajo del indicador; sin base válida, el dashboard muestra “Sin datos”.

Los datos de demostración son inventados. No deben interpretarse como resultados del estudio.

## Despliegue

El proyecto incluye `vercel.json` para sus rutas en Vercel. En Firebase Hosting, `firebase.json` publica `public` y enlaza `firestore.secure.rules`. Los módulos de Firebase, Chart.js y SheetJS se cargan desde CDN; los sitios deben servirse por HTTPS.
