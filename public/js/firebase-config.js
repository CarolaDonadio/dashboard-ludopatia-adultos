const firebaseConfig = {
  apiKey: 'AIzaSyDApIvpYa_syuLweHJMngopLzjWn14W-L4',
  authDomain: 'dashboard-ludopatia-adultos.firebaseapp.com',
  projectId: 'dashboard-ludopatia-adultos',
  storageBucket: 'dashboard-ludopatia-adultos.firebasestorage.app',
  messagingSenderId: '355422244023',
  appId: '1:355422244023:web:31455ba6c818dfec3f1132'
};

const storageKey = 'ludostats-respuestas-v1';
let firebaseServices;

function firebaseConfigValues() {
  return [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId
  ];
}

export function isFirebaseConfigured() {
  return firebaseConfigValues().every(value => value && !value.startsWith('TU_') && value !== 'tu-proyecto.firebaseapp.com' && value !== 'tu-proyecto');
}

export function isFirebasePartiallyConfigured() {
  return firebaseConfigValues().some(value => value && !value.startsWith('TU_') && value !== 'tu-proyecto.firebaseapp.com' && value !== 'tu-proyecto') && !isFirebaseConfigured();
}

async function getFirebaseServices() {
  if (!isFirebaseConfigured()) throw new Error('Firebase todavía no está configurado.');
  if (!firebaseServices) {
    const [{ initializeApp }, { getFirestore }, { getAuth }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
    ]);
    const app = initializeApp(firebaseConfig);
    firebaseServices = { db: getFirestore(app), auth: getAuth(app) };
  }
  return firebaseServices;
}

export async function saveSurveyResponse(answers) {
  if (isFirebasePartiallyConfigured()) {
    throw new Error('La configuración de Firebase está incompleta. Revisá todos los valores antes de enviar.');
  }
  if (isFirebaseConfigured()) {
    const [{ db }, { addDoc, collection, serverTimestamp }] = await Promise.all([
      getFirebaseServices(),
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js')
    ]);
    await addDoc(collection(db, 'respuestas_encuesta'), {
      ...answers,
      fechaEnvio: serverTimestamp()
    });
    return { storage: 'firebase' };
  }

  const responses = readLocalResponses();
  responses.push({ ...answers, fechaEnvio: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(responses));
  return { storage: 'local' };
}

export function readLocalResponses() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function getSurveyResponses() {
  if (isFirebasePartiallyConfigured()) {
    throw new Error('La configuración de Firebase está incompleta.');
  }
  if (!isFirebaseConfigured()) return readLocalResponses();
  const [{ db }, { collection, getDocs, orderBy, query }] = await Promise.all([
    getFirebaseServices(),
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js')
  ]);
  const snapshot = await getDocs(query(collection(db, 'respuestas_encuesta'), orderBy('fechaEnvio', 'desc')));
  return snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
}

export async function signInAdmin(email, password) {
  const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
    getFirebaseServices(),
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
  ]);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  const [{ auth }, { signOut }] = await Promise.all([
    getFirebaseServices(),
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
  ]);
  return signOut(auth);
}

export async function observeAdmin(callback) {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  const [{ db, auth }, { onAuthStateChanged }, { doc, getDoc }] = await Promise.all([
    getFirebaseServices(),
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js')
  ]);
  return onAuthStateChanged(auth, async user => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      const adminDocument = await getDoc(doc(db, 'administradores', user.uid));
      callback(adminDocument.exists() ? user : null);
    } catch {
      callback(null);
    }
  });
}