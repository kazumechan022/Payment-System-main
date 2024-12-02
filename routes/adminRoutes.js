// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { adminDashboard, renderAddAdmin, createAdmin, verification, viewTransactionsByBranch} = require("../controllers/adminController");
const { managerDashboard } = require('../controllers/dashboardController');
const { isAdmin, isManager } = require("../middleware/authMiddleware");

// Admin dashboard route
router.get("/admindashboard", isAdmin, adminDashboard);
router.get("/addManager", isAdmin, renderAddAdmin); 
router.post("/addManager", isAdmin, createAdmin);
router.get("/verify-email/:verificationToken", verification);
router.get('/transactions-by-branch', isAdmin, viewTransactionsByBranch);

module.exports = router;
