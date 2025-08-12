const firebaseConfig = {
    apiKey: "AIzaSyBAr5ot9BbR5CUZezg2WnRqAuP7_PgszBc",
    authDomain: "ecommerce-web-77a30.firebaseapp.com",
    projectId: "ecommerce-web-77a30",
    storageBucket: "ecommerce-web-77a30.firebasestorage.app",
    messagingSenderId: "735474214702",
    appId: "1:735474214702:web:4f5e48180c935ac5d1bcbf",
    measurementId: "G-XV6L26WHQP"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();