export const updateObject = (oldObject,updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

// export const connectFb = () => {
//   var admin = require("firebase-admin");
//   var serviceAccount = require("path/to/serviceAccountKey.json");

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://dmkit-e7e99.firebaseio.com"
//   });
// }