const Wallet = require("../models/Wallet");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId, balance: 0, transactions: [] });
  return wallet;
};

exports.getWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.userId);
    res.json({ success: true, wallet });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.createRechargeOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1)
      return res.status(400).json({ success: false, message: "Invalid amount" });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `wallet_${req.userId}_${Date.now()}`,
    });

    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    console.error("createRechargeOrder error", e?.error || e?.message || e);
    res.status(500).json({ success: false, message: e?.error?.description || e?.message || "Could not create order" });
  }
};

exports.verifyRecharge = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid payment signature" });

    const wallet = await getOrCreateWallet(req.userId);
    wallet.balance += amount;
    wallet.transactions.push({
      type: "credit",
      amount,
      description: "Wallet Recharge",
      balanceAfter: wallet.balance,
    });
    await wallet.save();

    res.json({ success: true, message: "Wallet recharged successfully", balance: wallet.balance });
  } catch (e) {
    console.error("verifyRecharge error", e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
