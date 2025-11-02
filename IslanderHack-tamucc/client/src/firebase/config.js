// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRpTaRFfJFE0-HLTLxb4TpsryfHofqtAg",
  authDomain: "authentication-37ad9.firebaseapp.com",
  projectId: "authentication-37ad9",
  storageBucket: "authentication-37ad9.firebasestorage.app",
  messagingSenderId: "260323682015",
  appId: "1:260323682015:web:b79e504ffc57fd4726eb6a",
  measurementId: "G-8QFR0R5V64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export { analytics };
export default app;
