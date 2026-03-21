require("dotenv").config();


const express = require("express");
const cors = require("cors");
const agenda = require("./config/agenda");


const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const petRoutes = require("./routes/petRoutes");
const visitRoutes = require("./routes/visitRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const subscriptionRoutes=require("./routes/subscriptionRoutes");
const boardingRoutes=require("./routes/boardingRoutes")
const paymentRoutes=require("./routes/paaymentroutes")
const customerServicesRoutes=require("./routes/CustomerServiceRoutes")
const customerAppointment = require("./routes/CustomerAppointmentroutes")
const onlineCustomer = require("./routes/OnlineCustomerRoutes");
const prescription=require("./routes/Prescription")
const customerPaymentRoutes=require("./routes/customerRoutes/checkoutRoutes")
const customerWebhookRoutes=require("./routes/customerRoutes/customerWebhookRoutes")
const customerPetRoutes=require("./routes/customerRoutes/CustomerPetRoute")
const useMedicineRoutes=require("./routes/useMedicineRoutes")

const app = express();

app.use('/api/v1/customer-webhook', express.raw({ type: 'application/json' }), customerWebhookRoutes);

const allowedOrigins = [
  "https://doggosheaven.com",
  "https://www.doggosheaven.com",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept-Type"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Always attach CORS headers even on errors
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

app.use(express.json());


const dbConnect = require("./config/db");
dbConnect();
agenda.start().then(() => {
  console.log("Agenda is working");
}).catch((err) => {
  console.error("Agenda failed to start:", err.message);
});




//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pet", petRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/visit", visitRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/subscription",subscriptionRoutes);
app.use("/api/v1/boarding",boardingRoutes);
app.use("/api/v1/payments",paymentRoutes);
app.use("/api/v1/customerservices",customerServicesRoutes);
app.use("/api/v1/customerappointment",customerAppointment);
app.use("/api/v1/appointment",onlineCustomer);
app.use("/api/v1/prescription",prescription);
app.use("/api/v1/customer/payment",customerPaymentRoutes)
app.use("/api/v1/customer/pet",customerPetRoutes);
app.use("/api/v1/medicine",useMedicineRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
  res.send(process.env.FRONTEND_URL)
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


