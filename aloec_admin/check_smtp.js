const admin = require('firebase-admin');
const serviceAccount = require('../clave/app-aloec-firebase-adminsdk-fbsvc-ce6c2dcc7e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  console.log('--- DOCUMENTOS DE LA COLECCIÓN admin_settings ---');
  const snap = await db.collection('admin_settings').get();
  snap.forEach(d => {
    console.log(`ID: ${d.id} ->`, JSON.stringify(d.data(), null, 2));
  });
}

run().catch(console.error);
