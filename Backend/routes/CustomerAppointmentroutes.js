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
  markVisitNotificationsRead,
  confirmAppointment,
  verifyAppointmentPayment,
  createPaymentOrder,
  savePushToken,
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
router.patch('/notifications/:customerId/markread', markVisitNotificationsRead);
router.patch('/confirmappoint/:id', confirmAppointment);
router.post('/verifypayment', verifyAppointmentPayment);
router.post('/createpaymentorder', createPaymentOrder);
router.post('/savepushtoken', savePushToken);

module.exports = router;
