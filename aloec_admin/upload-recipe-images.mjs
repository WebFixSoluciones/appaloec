import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';

const firebaseConfig = {
  apiKey: "AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4",
  authDomain: "app-aloec.firebaseapp.com",
  projectId: "app-aloec",
  storageBucket: "app-aloec.firebasestorage.app",
  messagingSenderId: "75165578833",
  appId: "1:75165578833:web:db63c434d7c68e848e6a70",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

const imageMap = [
  {
    docId: 'recipe_batido_quinua_dorada',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/batido_quinua_dorada_1783309942636.png',
    storageName: 'batido_quinua_dorada.png'
  },
  {
    docId: 'recipe_ensalada_colorida',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/ensalada_colorida_1783309950198.png',
    storageName: 'ensalada_colorida.png'
  },
  {
    docId: 'recipe_ensalada_frutas',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/ensalada_frutas_1783309958590.png',
    storageName: 'ensalada_frutas.png'
  },
  {
    docId: 'recipe_jugo_verde_renovador',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/jugo_verde_renovador_1783309972814.png',
    storageName: 'jugo_verde_renovador.png'
  },
  {
    docId: 'recipe_jugo_zanahoria',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/jugo_zanahoria_1783309981411.png',
    storageName: 'jugo_zanahoria.png'
  },
  {
    docId: 'recipe_jugo_zanahoria_manzana',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/jugo_zanahoria_manzana_1783309991833.png',
    storageName: 'jugo_zanahoria_manzana.png'
  },
  {
    docId: 'recipe_pescado_vapor',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/pescado_vapor_1783310006825.png',
    storageName: 'pescado_vapor.png'
  },
  {
    docId: 'recipe_pollo_vapor_ensalada',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/pollo_vapor_ensalada_1783310015474.png',
    storageName: 'pollo_vapor_ensalada.png'
  },
  {
    docId: 'recipe_sopa_vegetales',
    filePath: 'C:/Users/WEB FIX/.gemini/antigravity/brain/e6dd5de6-4db5-4001-9ee6-e47eddf53c22/sopa_vegetales_1783310023920.png',
    storageName: 'sopa_vegetales.png'
  }
];

async function uploadImages() {
  const email = process.argv[2] || await ask('Email Administrador: ');
  const password = process.argv[3] || await ask('Contraseña: ');
  rl.close();

  try {
    await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    console.log('✅ Autenticado correctamente como admin');
  } catch (e) {
    console.error('❌ Error de autenticación:', e.message);
    process.exit(1);
  }

  console.log('Subiendo imágenes de recetas a Firebase Storage y actualizando Firestore...');
  for (const item of imageMap) {
    try {
      const buffer = readFileSync(item.filePath);
      const storageRef = ref(storage, `recipes/${item.storageName}`);
      
      await uploadBytes(storageRef, buffer, { contentType: 'image/png' });
      const downloadUrl = await getDownloadURL(storageRef);
      
      const docRef = doc(db, 'recipes', item.docId);
      await updateDoc(docRef, { imageUrl: downloadUrl });
      console.log(`✅ [${item.docId}] Imagen subida: ${downloadUrl}`);
    } catch (err) {
      console.error(`❌ Error en ${item.docId}:`, err.message);
    }
  }
  console.log('🎉 Proceso de carga finalizado exitosamente.');
  process.exit(0);
}

uploadImages();
