const express = require("express");
const { useMedicine, getUsageLogs, getStockHistory, getRevenue } = require("../controllers/useMedicineController");
const { protectedRoute } = require("../middlewares/protectedRoute");

const router = express.Router();

router.post("/use",          protectedRoute, useMedicine);
router.get("/usagelogs",     protectedRoute, getUsageLogs);
router.get("/stockhistory",  protectedRoute, getStockHistory);
router.get("/revenue",       protectedRoute, getRevenue);

module.exports = router;
