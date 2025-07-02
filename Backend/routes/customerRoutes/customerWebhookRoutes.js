const express =require('express');
const { customerPaymentWebhook } = require('../../controllers/customerControllers/webhookControllers');

const router=express.Router();

router.post("/check-payment",customerPaymentWebhook);

module.exports=router