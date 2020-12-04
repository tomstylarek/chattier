import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyCUpv01zIUn0iva6jJ-6NkCVbaSFxwaoQo",
  authDomain: "slack-app-cc624.firebaseapp.com",
  databaseURL: "https://slack-app-cc624.firebaseio.com",
  projectId: "slack-app-cc624",
  storageBucket: "slack-app-cc624.appspot.com",
  messagingSenderId: "43530332645",
  appId: "1:43530332645:web:8b1697523b9015b73c270c",
  measurementId: "G-GYE5XRHWQT"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
