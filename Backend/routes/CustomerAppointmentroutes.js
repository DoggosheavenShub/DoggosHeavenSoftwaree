const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getCustomerAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
  getCustomerPetss,
  getNotifications,
  confirmAppointment,
  verifyAppointmentPayment,
  createPaymentOrder,
} = require('../controllers/CustomerAppointmentController');
const { customerProtectedRoute } = require('../middlewares/customerProtectedRoute');

router.get('/getcustomerpets', getCustomerPetss);
router.post('/createappoint', createAppointment);
router.get('/getcustomerappoint/:customerId', getCustomerAppointments);
router.get('/getallappoint', getAllAppointments);
router.get('/getaappointbyid/:id', getAppointmentById);
router.patch('/updateappoint/:id/status', updateAppointmentStatus);
router.delete('/cancelappoint/:id', cancelAppointment);
router.get('/notifications/:customerId', getNotifications);
router.patch('/confirmappoint/:id', confirmAppointment);
router.post('/verifypayment', verifyAppointmentPayment);
router.post('/createpaymentorder', createPaymentOrder);

module.exports = router;
