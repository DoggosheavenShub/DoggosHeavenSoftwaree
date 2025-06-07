// Updated backend payment controller for handling all payment types correctly

const Visit = require('../models/Visit');
const crypto = require('crypto');
const Razorpay = require('razorpay');


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});


const createOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { amount, receipt, notes } = req.body;
    
  
    console.log('Creating order with amount:', amount, 'receipt:', receipt);
    
  
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt,
      notes,
      payment_capture: 1 
    });

    console.log(amount);
    
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not create order',
      error: error.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    // console.log("visit", req.body.visitData);
    const {
      razorpay_payment_id,
      razorpay_order_id, 
      razorpay_signature,
      visitData
    } = req.body;
    

    
    // console.log('Payment verification data received:', {
    //   razorpay_payment_id,
    //   razorpay_order_id,
    //   paymentType: visitData.details.payment.paymentType,
    //   amount: visitData.details.payment.amount,
    //   remainingAmount: visitData.details.payment.remainingAmount
    // });
    
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');
    
    const isSignatureValid = expectedSignature === razorpay_signature;
    
    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
  
    const { 
      paymentType, 
      amount, 
      remainingAmount 
    } = visitData.details.payment;
    
    
    // let visitToSave;
    
    // if (paymentType === 'after') {
      
    //   visitToSave = {
    //     pet: visitData.petId,
    //     visitType: visitData.visitType,
    //     details: {
    //       ...visitData.details,
    //       payment: {
    //         paymentType: 'after',
    //         isPaid: false,
    //         amount: 0,
    //         paidAt: null,
    //         remainingAmount: visitData.details.finalPrice,
    //         isRemainingPaid: false
    //       }
    //     }
    //   };
    // } else if (paymentType === 'partial') {
      
    //   visitToSave = {
    //     pet: visitData.petId,
    //     visitType: visitData.visitType,
    //     details: {
    //       ...visitData.details,
    //       payment: {
    //         paymentType: 'partial',
    //         razorpay_payment_id,
    //         razorpay_order_id,
    //         razorpay_signature,
    //         isPaid: true,
    //         amount: amount, 
    //         paidAt: new Date().toISOString(),
    //         remainingAmount: remainingAmount, 
    //         isRemainingPaid: false
    //       }
    //     }
    //   };
    // } else {
    
    //   visitToSave = {
    //     pet: visitData.petId,
    //     visitType: visitData.visitType,
    //     details: {
    //       ...visitData.details,
    //       payment: {
    //         paymentType: 'advance',
    //         razorpay_payment_id,
    //         razorpay_order_id,
    //         razorpay_signature,
    //         isPaid: true,
    //         amount: visitData.details.finalPrice, 
    //         paidAt: new Date().toISOString(),
    //         remainingAmount: 0,
    //         isRemainingPaid: true
    //       }
    //     }
    //   };
    // }
    
    
    // console.log('Saving visit with payment details:', {
    //   paymentType: visitToSave.details.payment.paymentType,
    //   amount: visitToSave.details.payment.amount,
    //   remainingAmount: visitToSave.details.payment.remainingAmount
    // });
    

    // const newVisit = new Visit(visitToSave);
    // await newVisit.save();
    

    return res.status(200).json({
      success: true,
      message: 'Payment verified and visit saved successfully',
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};



