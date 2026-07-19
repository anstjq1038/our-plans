import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 공개 가능한 설정값 — 보안은 Firestore 규칙으로 처리
const firebaseConfig = {
  apiKey: "AIzaSyDCFzYfV_WZV62pJXt-eVZKeH88Pz2B8wI",
  authDomain: "travelplanner-a4a1c.firebaseapp.com",
  projectId: "travelplanner-a4a1c",
  storageBucket: "travelplanner-a4a1c.firebasestorage.app",
  messagingSenderId: "416406955183",
  appId: "1:416406955183:web:9def74d81b0d475b80a05a",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
