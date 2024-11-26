import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const imageFirebaseConfig = {
    apiKey: "AIzaSyANPw33bttHrZBufglLb9uy0mS-sHgavsU",
    authDomain: "createsyllabusuploading.firebaseapp.com",
    projectId: "createsyllabusuploading",
    storageBucket: "createsyllabusuploading.appspot.com",
    messagingSenderId: "402980380426",
    appId: "1:402980380426:web:3393368ebd9d07af0ba4f3"
};

const app = initializeApp(imageFirebaseConfig);
export const storage = getStorage(app);

