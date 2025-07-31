import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // 開発環境用の設定
  apiKey: "AIzaSyDummy-Key-For-Development-Only",
  authDomain: "eco-point-dev.firebaseapp.com",
  projectId: "eco-point-dev",
  storageBucket: "eco-point-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;