const BoardingSubscription = require("../models/BoardingSubscription");
const Wallet = require("../models/Wallet");
const Pet = require("../models/pet");
const sendPushNotification = require("../utils/sendPushNotification");
const User = require("../models/user");

const PRICE_PER_DAY = BoardingSubscription.PRICE_PER_DAY;

// ── User: create booking request ──────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { petIds } = req.body;
    if (!petIds || !petIds.length)
      return res.status(400).json({ success: false, message: "Select at least one pet" });

    const numberOfPets = petIds.length;
    const dailyCharge = parseFloat((PRICE_PER_DAY * numberOfPets).toFixed(2));

    const booking = await BoardingSubscription.create({
      userId: req.userId,
      petIds,
      numberOfPets,
      dailyCharge,
      status: "pending",
    });

    res.status(201).json({ success: true, message: "Booking request submitted for admin approval", booking });
  } catch (e) {
    console.error("createBooking error", e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── User: dashboard ───────────────────────────────────────────────────────────
exports.getUserDashboard = async (req, res) => {
  try {
    const [wallet, bookings] = await Promise.all([
      Wallet.findOne({ userId: req.userId }),
      BoardingSubscription.find({ userId: req.userId })
        .populate("petIds", "name species breed")
        .sort({ createdAt: -1 }),
    ]);

    const balance = wallet?.balance || 0;
    const active = bookings.find((b) => b.status === "active");

    const dashboard = {
      walletBalance: balance,
      activeBoarding: active
        ? {
            id: active._id,
            pets: active.petIds,
            numberOfPets: active.numberOfPets,
            dailyCharge: active.dailyCharge,
            daysRemaining: active.daysRemaining,
            startDate: active.startDate,
            endDate: active.endDate,
            estimatedDaysLeft: active.dailyCharge > 0 ? Math.floor(balance / active.dailyCharge) : 0,
            lowBalance: balance < active.dailyCharge * 2,
          }
        : null,
      bookings,
    };

    res.json({ success: true, dashboard });
  } catch (e) {
    console.error("getUserDashboard error", e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Admin: list all pending bookings ─────────────────────────────────────────
exports.adminListBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await BoardingSubscription.find(filter)
      .populate("userId", "fullName email phone expoPushToken")
      .populate("petIds", "name species breed")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Admin: approve / reject ───────────────────────────────────────────────────
exports.adminUpdateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, petIds, adminNote } = req.body; // action: "approve" | "reject"

    const booking = await BoardingSubscription.findById(bookingId).populate("userId", "expoPushToken fullName");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (action === "approve") {
      // Admin may modify petIds
      if (petIds && petIds.length) {
        booking.petIds = petIds;
        booking.numberOfPets = petIds.length;
        booking.dailyCharge = parseFloat((PRICE_PER_DAY * petIds.length).toFixed(2));
      }
      booking.status = "active";
      booking.startDate = new Date();
      booking.endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      booking.daysRemaining = 15;
      booking.adminNote = adminNote || "";

      // Notify user
      if (booking.userId?.expoPushToken) {
        sendPushNotification(
          booking.userId.expoPushToken,
          "Boarding Approved! 🐾",
          `Your 15-day boarding plan is now active. Daily charge: ₹${booking.dailyCharge}`
        );
      }
    } else if (action === "reject") {
      booking.status = "rejected";
      booking.adminNote = adminNote || "";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await booking.save();
    res.json({ success: true, message: `Booking ${action}d`, booking });
  } catch (e) {
    console.error("adminUpdateBooking error", e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Plan preview (cost calculator) ───────────────────────────────────────────
exports.getPlanPreview = async (req, res) => {
  const { numberOfPets } = req.query;
  const n = parseInt(numberOfPets) || 1;
  res.json({
    success: true,
    preview: {
      planName: "15 Days Boarding Plan",
      totalPrice: 11500,
      durationDays: 15,
      pricePerDay: PRICE_PER_DAY,
      numberOfPets: n,
      dailyCharge: parseFloat((PRICE_PER_DAY * n).toFixed(2)),
      totalCharge: parseFloat((PRICE_PER_DAY * n * 15).toFixed(2)),
    },
  });
};
