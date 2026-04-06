const express = require("express");
const { customerProtectedRoute } = require("../middlewares/customerProtectedRoute");
const { getWallet, createRechargeOrder, verifyRecharge } = require("../controllers/walletController");

const router = express.Router();

router.get("/", customerProtectedRoute, getWallet);
router.post("/recharge/order", customerProtectedRoute, createRechargeOrder);
router.post("/recharge/verify", customerProtectedRoute, verifyRecharge);

module.exports = router;
