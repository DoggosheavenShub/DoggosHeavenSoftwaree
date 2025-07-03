
const SubscriptionPlan = require("../../models/subscriptionPlan");
const Subscription = require("../../models/subscription");
const mongoose = require("mongoose");

const dotenv=require('dotenv');
dotenv.config();

const Pet = require('../../models/pet');

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});


exports.create_customer_checkout = async (req, res) => {

  try {
    
    const {email,planId,petId} = req.body;

    console.log(req.body)

    if (!email || !planId || !petId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    const PlanDetails = await SubscriptionPlan.findOne({ _id: planId });

    const options = {
      amount: PlanDetails.price * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        email,
        planId,
        petId,
        purpose:"subscription"
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success:true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/failure`,
      message:"Order created successfully"
    });

  } catch (error) {
    console.error("Error creating razor pay order", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};