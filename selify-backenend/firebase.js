const admin = require("firebase-admin");
const serviceAccount = require("./application-91b1d-firebase-adminsdk-6a7nf-7afb5b5a02.json");
const { getApps } = require("firebase-admin/app");
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY);

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
