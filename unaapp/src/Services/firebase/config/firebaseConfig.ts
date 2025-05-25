import { initializeApp } from "firebase/app";
import { getAuth , setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';


const firebaseConfig = {
  
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, { model: 'gemini-2.0-flash' });
const storage = getStorage(app);

const messaging = getMessaging(app);

const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistencia configurada correctamente.");
  })
  .catch((error) => {
    console.error("Error al configurar la persistencia:", error);
  });
 
export { auth, db, messaging, authReady, app, vertexAI,storage, model };