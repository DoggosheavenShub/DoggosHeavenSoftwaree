// Updated backend payment controller for handling all payment types correctly

const Visit = require('../models/Visit');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create order for payment
const createOrder = async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;
    
    // Log the incoming order data
    console.log('Creating order with amount:', amount, 'receipt:', receipt);
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      notes,
      payment_capture: 1 // Auto capture payment
    });
    
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

// Verify payment and save visit
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id, 
      razorpay_signature,
      visitData
    } = req.body;
    
    // Log the received data to debug
    console.log('Payment verification data received:', {
      razorpay_payment_id,
      razorpay_order_id,
      paymentType: visitData.details.payment.paymentType,
      amount: visitData.details.payment.amount,
      remainingAmount: visitData.details.payment.remainingAmount
    });
    
    // Verify signature
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
    
    // Extract payment details from visitData
    const { 
      paymentType, 
      amount, 
      remainingAmount 
    } = visitData.details.payment;
    
    // Different handling based on payment type
    let visitToSave;
    
    if (paymentType === 'after') {
      // For payment after service
      visitToSave = {
        pet: visitData.pet,
        visitType: visitData.visitType,
        details: {
          ...visitData.details,
          payment: {
            paymentType: 'after',
            isPaid: false,
            amount: 0,
            paidAt: null,
            remainingAmount: visitData.details.finalPrice,
            isRemainingPaid: false
          }
        }
      };
    } else if (paymentType === 'partial') {
      // For partial payment
      visitToSave = {
        pet: visitData.pet,
        visitType: visitData.visitType,
        details: {
          ...visitData.details,
          payment: {
            paymentType: 'partial',
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            isPaid: true,
            amount: amount, // This is the advance amount paid
            paidAt: new Date().toISOString(),
            remainingAmount: remainingAmount, // The amount to be paid later
            isRemainingPaid: false
          }
        }
      };
    } else {
      // For advance (full) payment
      visitToSave = {
        pet: visitData.pet,
        visitType: visitData.visitType,
        details: {
          ...visitData.details,
          payment: {
            paymentType: 'advance',
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            isPaid: true,
            amount: visitData.details.finalPrice, // Full amount
            paidAt: new Date().toISOString(),
            remainingAmount: 0,
            isRemainingPaid: true
          }
        }
      };
    }
    
    // Log what we're about to save
    console.log('Saving visit with payment details:', {
      paymentType: visitToSave.details.payment.paymentType,
      amount: visitToSave.details.payment.amount,
      remainingAmount: visitToSave.details.payment.remainingAmount
    });
    
    // Create and save the visit
    const newVisit = new Visit(visitToSave);
    await newVisit.save();
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment verified and visit saved successfully',
      data: newVisit
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



// // Updated backend payment controller for PayU integration

// const Visit = require('../models/Visit');
// const crypto = require('crypto');

// // Generate PayU hash for payment initialization
// const generatePayUHash = async (req, res) => {
//   try {
//     const { 
//       amount, 
//       txnid, 
//       productinfo, 
//       firstname, 
//       email, 
//       phone,
//       paymentType,
//       petId,
//       visitTypeId
//     } = req.body;
    
//     // Log the incoming payment data
//     console.log('Generating PayU hash for:', {
//       amount,
//       txnid,
//       paymentType,
//       petId,
//       visitTypeId
//     });
    
//     // PayU merchant key and salt from environment variables
//     const key = process.env.PAYU_MERCHANT_KEY;
//     const salt = process.env.PAYU_SALT;
    
//     if (!key || !salt) {
//       return res.status(500).json({
//         success: false,
//         message: 'PayU configuration missing'
//       });
//     }
    
//     // Save payment info temporarily in session or DB if needed
//     // This is optional but useful for tracking initiated payments
    
//     // Generate hash string for PayU
//     // Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
//     const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${paymentType}|${amount}|0|||||||${salt}`;
    
//     const hash = crypto
//       .createHash('sha512')
//       .update(hashString)
//       .digest('hex');
    
//     // Create payment data for frontend
//     const paymentData = {
//       action: process.env.NODE_ENV === 'production' 
//         ? 'https://secure.payu.in/_payment' 
//         : 'https://sandboxsecure.payu.in/_payment',
//       fields: {
//         key,
//         txnid,
//         amount,
//         productinfo,
//         firstname,
//         email,
//         phone,
//         surl: `${process.env.FRONTEND_URL}/payment/success`, // Success URL
//         furl: `${process.env.FRONTEND_URL}/payment/failure`, // Failure URL
//         hash,
//         // Include service provider for PayU Money
//         service_provider: 'payu_paisa'
//       }
//     };
    
//     return res.status(200).json({
//       success: true,
//       paymentData
//     });
//   } catch (error) {
//     console.error('Error generating PayU hash:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Could not generate PayU hash',
//       error: error.message
//     });
//   }
// };

// // Verify PayU payment and save visit
// const verifyPayment = async (req, res) => {
//   try {
//     const {
//       status,
//       txnid,
//       mihpayid, // PayU payment ID
//       hash,
//       udf1, // paymentType
//       udf2, // amount paid
//       udf3, // remaining amount (for partial payments)
//       visitData
//     } = req.body;
    
//     // Log the received data to debug
//     console.log('Payment verification data received:', {
//       status,
//       txnid,
//       mihpayid,
//       paymentType: udf1,
//       amountPaid: udf2,
//       remainingAmount: udf3
//     });
    
//     // Verify hash if needed (implementation depends on your PayU setup)
//     // Note: For proper production implementation, you should verify the payment
//     // with PayU's verification API or using the hash
    
//     if (status !== 'success') {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment was not successful'
//       });
//     }
    
//     // Extract payment details
//     const paymentType = udf1;
//     const amount = parseFloat(udf2);
//     const remainingAmount = parseFloat(udf3 || 0);
    
//     // Different handling based on payment type
//     let visitToSave;
    
//     if (paymentType === 'after') {
//       // For payment after service
//       visitToSave = {
//         pet: visitData.pet,
//         visitType: visitData.visitType,
//         details: {
//           ...visitData.details,
//           payment: {
//             paymentType: 'after',
//             isPaid: false,
//             amount: 0,
//             paidAt: null,
//             remainingAmount: visitData.details.finalPrice,
//             isRemainingPaid: false
//           }
//         }
//       };
//     } else if (paymentType === 'partial') {
//       // For partial payment
//       visitToSave = {
//         pet: visitData.pet,
//         visitType: visitData.visitType,
//         details: {
//           ...visitData.details,
//           payment: {
//             paymentType: 'partial',
//             payu_payment_id: mihpayid,
//             payu_txnid: txnid,
//             isPaid: true,
//             amount: amount, // This is the advance amount paid
//             paidAt: new Date().toISOString(),
//             remainingAmount: remainingAmount, // The amount to be paid later
//             isRemainingPaid: false
//           }
//         }
//       };
//     } else {
//       // For advance (full) payment
//       visitToSave = {
//         pet: visitData.pet,
//         visitType: visitData.visitType,
//         details: {
//           ...visitData.details,
//           payment: {
//             paymentType: 'advance',
//             payu_payment_id: mihpayid,
//             payu_txnid: txnid,
//             isPaid: true,
//             amount: visitData.details.finalPrice, // Full amount
//             paidAt: new Date().toISOString(),
//             remainingAmount: 0,
//             isRemainingPaid: true
//           }
//         }
//       };
//     }
    
//     // Log what we're about to save
//     console.log('Saving visit with payment details:', {
//       paymentType: visitToSave.details.payment.paymentType,
//       amount: visitToSave.details.payment.amount,
//       remainingAmount: visitToSave.details.payment.remainingAmount
//     });
    
//     // Create and save the visit
//     const newVisit = new Visit(visitToSave);
//     await newVisit.save();
    
//     // Return success response
//     return res.status(200).json({
//       success: true,
//       message: 'Payment verified and visit saved successfully',
//       data: newVisit
//     });
//   } catch (error) {
//     console.error('Error in verifyPayment:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error verifying payment',
//       error: error.message
//     });
//   }
// };

// // Handle PayU webhook notifications (optional but recommended)
// const payuWebhook = async (req, res) => {
//   try {
//     // PayU sends payment status updates via webhooks
//     const paymentData = req.body;
    
//     console.log('PayU webhook received:', paymentData);
    
//     // Verify the authenticity of the webhook
//     // Implementation depends on PayU's webhook format
    
//     // Process payment status update
//     // Update the visit or payment status in database
    
//     // Respond to PayU
//     return res.status(200).json({
//       success: true,
//       message: 'Webhook received successfully'
//     });
//   } catch (error) {
//     console.error('Error processing PayU webhook:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error processing webhook',
//       error: error.message
//     });
//   }
// };

// // Get payment status from PayU (for manual verification)
// const checkPaymentStatus = async (req, res) => {
//   try {
//     const { txnid } = req.params;
    
//     // Implement PayU payment verification API call
//     // This would typically involve making an API call to PayU's verification endpoint
    
//     // Example pseudocode (actual implementation will depend on PayU's API):
//     /*
//     const response = await axios.post('https://info.payu.in/merchant/postservice', {
//       key: process.env.PAYU_MERCHANT_KEY,
//       command: 'verify_payment',
//       var1: txnid,
//       hash: generatedHash // Generate as per PayU's requirements
//     });
    
//     const paymentStatus = response.data;
//     */
    
//     // For now, we'll just return a placeholder
//     return res.status(200).json({
//       success: true,
//       message: 'Payment status check feature will be implemented soon',
//       txnid
//     });
//   } catch (error) {
//     console.error('Error checking payment status:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error checking payment status',
//       error: error.message
//     });
//   }
// };

// // Record remaining payment for partial payments
// const recordRemainingPayment = async (req, res) => {
//   try {
//     const { visitId, paymentDetails } = req.body;
    
//     // Find the visit
//     const visit = await Visit.findById(visitId);
    
//     if (!visit) {
//       return res.status(404).json({
//         success: false,
//         message: 'Visit not found'
//       });
//     }
    
//     // Update payment details
//     visit.details.payment.isRemainingPaid = true;
//     visit.details.payment.remainingPaidAt = new Date().toISOString();
//     visit.details.payment.remainingPaymentId = paymentDetails.mihpayid || paymentDetails.id;
    
//     // Save the updated visit
//     await visit.save();
    
//     return res.status(200).json({
//       success: true,
//       message: 'Remaining payment recorded successfully',
//       data: visit
//     });
//   } catch (error) {
//     console.error('Error recording remaining payment:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error recording remaining payment',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   generatePayUHash,
//   verifyPayment,
//   payuWebhook,
//   checkPaymentStatus,
//   recordRemainingPayment
// };

