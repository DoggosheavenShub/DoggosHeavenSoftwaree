const express =require('express');
const {protectedRoute}=require("../../middlewares/protectedRoute")
const { create_customer_checkout } = require('../../controllers/customerControllers/checkoutControllers');
const router=express.Router();

router.post("/create-order",protectedRoute,create_customer_checkout);

module.exports=router