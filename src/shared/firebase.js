import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBsTyG7u3jAKpheMyvqD87AKMlBVo7F5TE",
  authDomain: "dmkit-e7e99.firebaseapp.com",
  databaseURL: "https://dmkit-e7e99.firebaseio.com",
  projectId: "dmkit-e7e99",
  storageBucket: "dmkit-e7e99.appspot.com",
  messagingSenderId: "843541688602",
  appId: "1:843541688602:web:1d8c43bebbcbc31a95fca3"
};

const fire = firebase.initializeApp(firebaseConfig);

export default fire;