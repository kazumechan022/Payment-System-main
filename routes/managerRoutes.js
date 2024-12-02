// routes/managerRoutes.js
const express = require("express");
const router = express.Router();
const { renderAddPackage, createPackage, managerDashboard, updatePackage, deletePackage, updatePackageForm, viewTransactions, updateTransactionForm, updateTransaction,  deleteTransaction, searchTransactions} = require("../controllers/dashboardController");
const { isManager } = require("../middleware/authMiddleware");

// Manager dashboard route
router.get("/managerdashboard", isManager, managerDashboard);

router.get("/managerdashboard/updatePackage/:id", isManager, updatePackageForm);
router.post("/managerdashboard/updatePackage/:id", isManager, updatePackage);
router.post("/managerdashboard/deletePackage/:id", isManager, deletePackage);
router.get('/addPackage', isManager, renderAddPackage); // Route to render add package page
router.post('/addPackage', isManager, createPackage);

router.get('/transactions/search', isManager, searchTransactions);

// New route to view transactions
router.get("/managertransactions", isManager, viewTransactions);

router.post('/transactions/delete/:id', isManager, deleteTransaction);





module.exports = router;
