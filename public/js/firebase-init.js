(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBlZKmyzJ7p2QKThxk6Sr4Nb4IODAfzKZs",
    authDomain: "relationships-d7fce.firebaseapp.com",
    databaseURL: "https://relationships-d7fce-default-rtdb.firebaseio.com",
    projectId: "relationships-d7fce",
    storageBucket: "relationships-d7fce.firebasestorage.app",
    messagingSenderId: "919566009579",
    appId: "1:919566009579:web:7d148997661f639b7e6aae",
    measurementId: "G-103FV91SZ4"
  };

  const useEmulators =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  firebase.initializeApp(firebaseConfig);

  if (useEmulators) {
    firebase.auth().useEmulator("http://127.0.0.1:9099");
    firebase.database().useEmulator("127.0.0.1", 9000);
  }

  window.connectionCardsFirebase = {
    auth: firebase.auth(),
    db: firebase.database()
  };
})();
