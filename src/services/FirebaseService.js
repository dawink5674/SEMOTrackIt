import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByIcBoFAxaCedcmt8t9wTLkb9Pd4euMKI",
  authDomain: "semotrack-it.firebaseapp.com",
  databaseURL: "https://semotrack-it-default-rtdb.firebaseio.com",
  projectId: "semotrack-it",
  storageBucket: "semotrack-it.firebasestorage.app",
  messagingSenderId: "116848776295",
  appId: "1:116848776295:web:a89e1a89312262026af0c2",
  measurementId: "G-Y57X0Q4H5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Authentication functions
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Database functions
export const getShuttles = (callback) => {
  const shuttlesRef = ref(database, 'shuttles');
  onValue(shuttlesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updateShuttle = (shuttleId, shuttleData) => {
  const shuttleRef = ref(database, `shuttles/${shuttleId}`);
  set(shuttleRef, shuttleData);
};
