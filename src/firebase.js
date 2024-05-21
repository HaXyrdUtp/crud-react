// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuLSGQncQ0mM9xsOt2kDy7KRKYZIbBECY",
  authDomain: "crud-pruebatecnica.firebaseapp.com",
  projectId: "crud-pruebatecnica",
  storageBucket: "crud-pruebatecnica.appspot.com",
  messagingSenderId: "508156735799",
  appId: "1:508156735799:web:ff9d6508660a2e904e2ab2",
  measurementId: "G-8G8F2JXFC0"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };