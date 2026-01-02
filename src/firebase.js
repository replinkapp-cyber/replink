import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <--- 여기 GoogleAuthProvider가 꼭 있어야 합니다!

const firebaseConfig = {
  apiKey: "AIzaSyC_z32P4Y4o5-jvkyqjw2Dx14PIyThO9aU",
  authDomain: "replink-249dd.firebaseapp.com",
  projectId: "replink-249dd",
  storageBucket: "replink-249dd.firebasestorage.app",
  messagingSenderId: "774208891038",
  appId: "1:774208891038:web:53d0dcabe6651efaf4b38f",
  measurementId: "G-8SY3EB40K9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// 이제 에러 없이 작동할 겁니다!
export const googleProvider = new GoogleAuthProvider();