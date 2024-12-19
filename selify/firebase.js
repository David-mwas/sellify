// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWuUHzYGysNeWZq2oGRbg1KNdor5ldPyc",
  authDomain: "auto-nipange-d99fa.firebaseapp.com",
  projectId: "auto-nipange-d99fa",
  storageBucket: "auto-nipange-d99fa.firebasestorage.app",
  messagingSenderId: "791255933131",
  appId: "1:791255933131:web:b8542c8e8c65672a82fb4e",
  measurementId: "G-DE56Z02BWM",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db, app };
