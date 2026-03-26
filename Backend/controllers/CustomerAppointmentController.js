const Appointment = require('../models/Customerapointment');
const Service = require('../models/customerservice');
const User = require('../models/user');
const Pet = require('../models/pet');
const Owner = require('../models/Owner');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


const getCustomerPetss = async (req, res) => {
  try {
    console.log("hey ");
    // const { email } = req.body; 
    const { email } = req.query;
    
    console.log(email);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }
    
    // Find customer by email and populate pets in one query
    const customer = await Owner.findOne({ email: email }).populate('pets');
    
    console.log(typeof customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if no pets are registered for this customer
    if (!customer.pets || customer.pets.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pets registered for this customer',
        pets: []
      });
    }
    
    // Return pets if found
    res.status(200).json({
      success: true,
      message: `Found ${customer.pets.length} pet(s) for this customer`,
      pets: customer.pets
    });
    
  } catch (error) {
    console.error('Error fetching customer pets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pets',
      error: error.message
    });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      customerId,
      serviceId,
      serviceName,
      servicePrice,
      appointmentDate,
      appointmentTime,
      petName,
      petBreed,
      petAge,
      notes,
      totalAmount
    } = req.body;

    
    if (!customerId || !appointmentDate || !appointmentTime || !petName || !petAge) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all hii required fields'
      });
    }

    
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    
    const existingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    const appointment = new Appointment({
      customerId,
      serviceId: serviceId || null,
      serviceName: serviceName || 'Service',
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      petName: petName.trim(),
      petBreed: petBreed ? petBreed.trim() : '',
      petAge: petAge.trim(),
      notes: notes ? notes.trim() : '',
      totalAmount: totalAmount || servicePrice || 0,
      status: 'pending'
    });

    await appointment.save();

    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price duration category');

    res.status(201).json({
      success: true,
      data: populatedAppointment,
      message: 'Appointment booked successfully'
    });
  } catch (error) {

   console.log('Full error object:', error);
  console.log('Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};




const getCustomerAppointments = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const appointments = await Appointment.find({ customerId })
      .populate('serviceId', 'name price duration category')
      .populate('customerId', 'name email phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
      message: 'Appointments fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Get all appointments (admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('serviceId', 'name price duration category')
      .populate('customerId', 'name email phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
      message: 'All appointments fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('serviceId', 'name price duration category')
     .populate('customerId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('serviceId', 'name price duration category')
      .populate('customerId', 'name email phone');

    res.status(200).json({
      success: true,
      data: populatedAppointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('serviceId', 'name price duration category')
      .populate('customerId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const appointments = await Appointment.find({ customerId }).sort({ updatedAt: -1 }).limit(20);

    const notifications = appointments.map((appt) => {
      const date = new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      let title, body, type;

      switch (appt.status) {
        case "confirmed":
          title = "Booking Confirmed! ✅";
          body = appt.paymentStatus === "paid"
            ? `Your ${appt.serviceName} for ${appt.petName} on ${date} is confirmed & paid.`
            : `Your ${appt.serviceName} for ${appt.petName} on ${date} is confirmed. Please complete the payment of ₹${appt.totalAmount} to secure your booking.`;
          type = "confirmed";
          break;
        case "completed":
          title = "Service Completed 🎉";
          body = `${appt.serviceName} for ${appt.petName} has been completed successfully on ${date}.`;
          type = "completed";
          break;
        case "cancelled":
          title = "Booking Cancelled";
          body = `Your ${appt.serviceName} appointment for ${appt.petName} on ${date} was cancelled.`;
          type = "cancelled";
          break;
        default:
          title = "Booking Received 📋";
          body = `Your ${appt.serviceName} request for ${appt.petName} on ${date} is pending confirmation from our team.`;
          type = "pending";
      }

      return {
        id: appt._id,
        title,
        body,
        type,
        time: appt.updatedAt,
        amount: appt.totalAmount,
        paymentStatus: appt.paymentStatus,
        read: false,
      };
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
  }
};

// Confirm appointment by admin + create Razorpay order
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Appointment is already ${appointment.status}` });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error confirming appointment', error: error.message });
  }
};

// Verify payment after user pays
const verifyAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Payment verified successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
  }
};

// Create Razorpay order for customer payment
const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    console.log('createPaymentOrder called:', { appointmentId, amount });
    console.log('Razorpay Key:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
    console.log('Razorpay Secret:', process.env.RAZORPAY_SECRET ? 'SET' : 'NOT SET');

    if (!appointmentId || !amount) {
      return res.status(400).json({ success: false, message: 'appointmentId and amount are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Already paid' });
    }

    // Reuse existing order if available
    if (appointment.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        order: { id: appointment.razorpayOrderId },
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount) * 100,
      currency: 'INR',
      receipt: `appt_${appointmentId}`,
      notes: { appointmentId: appointmentId.toString(), purpose: 'appointment' },
      payment_capture: 1,
    });

    appointment.razorpayOrderId = order.id;
    await appointment.save();

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error.message, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};