// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", (req, res) => {
    res.render("login"); 
});
router.get("/landingpage", (req, res) => {
    res.render("landingpage"); 
});
router.get("/about", (req, res) => {
    res.render("about"); 
});
router.get("/contact", (req, res) => {
    res.render("contact"); 
});

router.get("/sign_up", (req, res) => {
    res.render("index"); 
});

router.get("/forgot-password", (req, res) => {
    res.render("forgotPassword"); 
});
router.get("/reset-password/:resetToken", (req, res) => {
    res.render("resetPassword", { resetToken: req.params.resetToken }); 
});

router.post("/sign_up", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/verify-email/:verificationToken", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:resetToken", authController.resetPassword);



module.exports = router;
