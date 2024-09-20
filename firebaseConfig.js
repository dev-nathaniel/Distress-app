import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD7mDOc2zEhtGyryEluHiTbqGrolBMnxQM",
    authDomain: "distress-2b3cd.firebaseapp.com",
    databaseURL: "https://distress-2b3cd-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "distress-2b3cd",
    storageBucket: "distress-2b3cd.appspot.com",
    messagingSenderId: "516886295055",
    appId: "1:516886295055:web:e083ae993c26429daea97a",
    measurementId: "G-S8119B19K2"
  };

export const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
