// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDhEf7uvFeGLGppX5ZP0DwSIsp75f8D1WI",
    authDomain: "watch-party-d11c2.firebaseapp.com",
    projectId: "watch-party-d11c2",
    storageBucket: "watch-party-d11c2.firebasestorage.app",
    messagingSenderId: "871398241220",
    appId: "1:871398241220:web:1605931f1a2a7c7f6cea91"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  export const auth = getAuth(app);
  export const db = getFirestore(app);