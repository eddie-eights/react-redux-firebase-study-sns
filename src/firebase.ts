// firebaseのConfigファイル
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

// .envで設定した環境変数を割り当てる
const firebaseConfig = {
	apiKey: "REACT_APP_FIREBASE_APIKEY",
	authDomain: "REACT_APP_FIREBASE_DOMAIN",
	projectId: "REACT_APP_FIREBASE_PROJECT_ID",
	storageBucket: "REACT_APP_FIREBASE_STORAGE_BUCKET",
	messagingSenderId: "REACT_APP_FIREBASE_SENDER_ID",
	appId: "REACT_APP_FIREBASE_APP_ID",
};
// firebaseをinitialize
const firebaseApp = firebase.initializeApp(firebaseConfig);

export const db = firebaseApp.firestore();
export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider(); //<- Googleサインインに必要
export const storage = firebase.storage();
