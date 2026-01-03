import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <--- 여기 GoogleAuthProvider가 꼭 있어야 합니다!

const firebaseConfig = {
  apiKey: "111",
  authDomain: "111",
  projectId: "11",
  storageBucket: "111",
  messagingSenderId: "11",
  appId: "1:111",
  measurementId: "G-11"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// 이제 에러 없이 작동할 겁니다!
export const googleProvider = new GoogleAuthProvider();