// app.js
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

const clientRoutes = require("./routes/clientRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

require('./scheduler/paymentScheduler');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "your_secret_key", // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
}));

// Middleware to set req.user from session
app.use((req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user; // Persist user data across requests
    }
    next();
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Database');
const db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.redirect('landingpage'); // Adjust to your login page
});

// Use the routes
app.use(authRoutes);
app.use(adminRoutes);   
app.use(clientRoutes);
app.use(managerRoutes);
app.use(purchaseRoutes);

app.listen(3003, () => {
    console.log(`Server is running on http://localhost:3003`);
});
