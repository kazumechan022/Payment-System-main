const express = require("express");
const router = express.Router();
const { isClient } = require("../middleware/authMiddleware");
const { clientDashboard } = require("../controllers/clientController");

// Client dashboard route
router.get('/clientdashboard', isClient, clientDashboard);


module.exports = router;
