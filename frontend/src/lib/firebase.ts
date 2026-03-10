import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApcbg57B0k8IDg6Rdt0Krkh9Wf_SVMVvI",
  authDomain: "kubemind-staging.firebaseapp.com",
  projectId: "kubemind-staging",
  storageBucket: "kubemind-staging.firebasestorage.app",
  messagingSenderId: "446293329392",
  appId: "1:446293329392:web:b70a20971c455a9934c935",
  measurementId: "G-EZSJHDELB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth instance and provider to use across the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
