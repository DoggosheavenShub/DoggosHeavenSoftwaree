const express = require('express');
const { addinventory, editInventory, getInventoryList, getInventoryItemDetails, getAlertListOfInventory, deleteInventory, lowStockAlertsSSE } = require('../controllers/inventoryController');
const { protectedRoute, authorizeRole } = require("../middlewares/protectedRoute");

const router = express.Router();

const adminOrStaff = authorizeRole(["admin", "staff"]);

router.post("/addinventory",          protectedRoute, adminOrStaff, addinventory);
router.post("/editinventory",         protectedRoute, adminOrStaff, editInventory);
router.delete('/deleteinventory/:id', protectedRoute, adminOrStaff, deleteInventory);

router.get("/getallinventory",             protectedRoute, adminOrStaff, getInventoryList);
router.get("/getinventoryitemdetails/:id", protectedRoute, adminOrStaff, getInventoryItemDetails);
router.get("/getalertlist",                protectedRoute, adminOrStaff, getAlertListOfInventory);
router.get("/lowstockalerts-sse",          protectedRoute, adminOrStaff, lowStockAlertsSSE);

module.exports = router;
