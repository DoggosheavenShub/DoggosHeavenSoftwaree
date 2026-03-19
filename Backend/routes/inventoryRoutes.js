const express = require('express');
const { addinventory, editInventory, getInventoryList, getInventoryItemDetails, getAlertListOfInventory, deleteInventory, lowStockAlertsSSE } = require('../controllers/inventoryController');
const { protectedRoute, authorizeRole } = require("../middlewares/protectedRoute");

const router = express.Router();

const adminOnly = authorizeRole(["admin"]);
const anyRole   = authorizeRole(["admin", "staff"]);

router.post("/addinventory",          protectedRoute, adminOnly, addinventory);
router.post("/editinventory",         protectedRoute, adminOnly, editInventory);
router.delete('/deleteinventory/:id', protectedRoute, adminOnly, deleteInventory);

router.get("/getallinventory",           protectedRoute, anyRole, getInventoryList);
router.get("/getinventoryitemdetails/:id", protectedRoute, anyRole, getInventoryItemDetails);
router.get("/getalertlist",              protectedRoute, anyRole, getAlertListOfInventory);
router.get("/lowstockalerts-sse",        protectedRoute, anyRole, lowStockAlertsSSE);

module.exports = router;
