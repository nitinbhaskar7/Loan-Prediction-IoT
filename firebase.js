// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm42Ur-FJt7p_fwipr6MB7DdFAQlWPvTE",
  authDomain: "otp-auth-62e7c.firebaseapp.com",
  projectId: "otp-auth-62e7c",
  storageBucket: "otp-auth-62e7c.firebasestorage.app",
  messagingSenderId: "425274062146",
  appId: "1:425274062146:web:1afdd55b13a602967404db",
  measurementId: "G-4WYX908XCS"
};

// Initialize Firebase
const app = getApps().length === 0 ?  initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export {auth} ;