const express = require("express");
const router = express.Router();
const { isManager } = require("../middleware/authMiddleware");
const { handlePurchase, renderPurchasePage } = require("../controllers/purchaseController");

// Route to handle the purchase form submission
router.post("/purchase/:packageId", isManager, handlePurchase);
router.get("/purchase/:packageId",  isManager, renderPurchasePage);
module.exports = router;
