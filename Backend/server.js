require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// CORS — must be first
const allowedOrigins = [
  "https://doggosheaven.com",
  "https://www.doggosheaven.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:19006",
  "exp://localhost:8081",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Routes imports
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const petRoutes = require("./routes/petRoutes");
const visitRoutes = require("./routes/visitRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const boardingRoutes = require("./routes/boardingRoutes");
const paymentRoutes = require("./routes/paaymentroutes");
const customerServicesRoutes = require("./routes/CustomerServiceRoutes");
const customerAppointment = require("./routes/CustomerAppointmentroutes");
const onlineCustomer = require("./routes/OnlineCustomerRoutes");
const prescription = require("./routes/Prescription");
const customerPaymentRoutes = require("./routes/customerRoutes/checkoutRoutes");
const customerWebhookRoutes = require("./routes/customerRoutes/customerWebhookRoutes");
const customerPetRoutes = require("./routes/customerRoutes/CustomerPetRoute");
const useMedicineRoutes = require("./routes/useMedicineRoutes");
const alertRoutes = require("./routes/alertRoutes");
const walletRoutes = require("./routes/walletRoutes");
const boardingSubscriptionRoutes = require("./routes/boardingSubscriptionRoutes");
// node-cron doesn't work on Vercel serverless — only load in non-serverless environments
if (!process.env.VERCEL) require("./jobs/dailyBoardingDeduction");

app.use('/api/v1/customer-webhook', express.raw({ type: 'application/json' }), customerWebhookRoutes);
app.use(express.json());

// DB connect
const dbConnect = require("./config/db");
dbConnect().catch((err) => console.error("DB connection failed:", err.message));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pet", petRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/visit", visitRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/boarding", boardingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/customerservices", customerServicesRoutes);
app.use("/api/v1/customerappointment", customerAppointment);
app.use("/api/v1/appointment", onlineCustomer);
app.use("/api/v1/prescription", prescription);
app.use("/api/v1/customer/payment", customerPaymentRoutes);
app.use("/api/v1/customer/pet", customerPetRoutes);
app.use("/api/v1/medicine", useMedicineRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/boarding-subscription", boardingSubscriptionRoutes);

app.get("/", (req, res) => {
  res.send(process.env.FRONTEND_URL);
});

app.get("/debug", (req, res) => {
  res.json({
    MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? "SET" : "MISSING",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
    RAZORPAY_KEY_ID_VAL: process.env.RAZORPAY_KEY_ID?.slice(0, 10) + "...",
    RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? "SET" : "MISSING",
    FRONTEND_URL: process.env.FRONTEND_URL ? "SET" : "MISSING",
    VERCEL: process.env.VERCEL || "not set",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
