const Appointment = require('../models/Customerapointment');
const User = require('../models/user');


const getBookingRevenue = async (req, res) => {
  try {
    const { year, month, day, page = 1, limit = 10 } = req.query;

    const match = {};
    if (year || month || day) {
      const y = parseInt(year) || new Date().getFullYear();
      const m = month ? parseInt(month) - 1 : null;
      const d = day ? parseInt(day) : null;
      let start, end;
      if (d && m !== null) {
        start = new Date(y, m, d, 0, 0, 0);
        end   = new Date(y, m, d, 23, 59, 59);
      } else if (m !== null) {
        start = new Date(y, m, 1);
        end   = new Date(y, m + 1, 0, 23, 59, 59);
      } else {
        start = new Date(y, 0, 1);
        end   = new Date(y, 11, 31, 23, 59, 59);
      }
      match.appointmentDate = { $gte: start, $lte: end };
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(match);

    const appointments = await Appointment.find(match)
      .populate('customerId', 'fullName email')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const all = await Appointment.find(match).select('totalAmount paymentStatus status serviceName');

    const totalRevenue  = all.reduce((s, a) => s + (a.totalAmount || 0), 0);
    const totalPaid     = all.filter(a => a.paymentStatus === 'paid').reduce((s, a) => s + (a.totalAmount || 0), 0);
    const totalPending  = all.filter(a => a.paymentStatus === 'pending').reduce((s, a) => s + (a.totalAmount || 0), 0);
    const totalCompleted = all.filter(a => a.status === 'completed').length;
    const totalCancelled = all.filter(a => a.status === 'cancelled').length;

    res.json({
      success: true,
      logs: appointments,
      totalCount: total,
      summary: { totalRevenue, totalPaid, totalPending, totalCompleted, totalCancelled },
    });
  } catch (error) {
    console.error('Error fetching booking revenue:', error);
    res.status(500).json({ success: false, message: 'Error fetching booking revenue' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};

  
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.appointmentDate = {
        $gte: selectedDate,
        $lt: nextDay
      };
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'fullName email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching appointments' 
    });
  }
};


const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, visitNotes } = req.body;

  
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = { status };
    
    
    if (visitNotes && visitNotes.trim()) {
      updateData.notes = visitNotes.trim();
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'fullName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status'
    });
  }
};

module.exports = {
  getBookingRevenue,
  getAppointments,
  updateAppointmentStatus
};