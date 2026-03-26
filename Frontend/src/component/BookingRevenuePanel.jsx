import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getBookingRevenue } from "../store/slices/CustomerAppointmentslice";
import { Button, TextField, MenuItem } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RevenueChart from "./Revenue/Revenuechart";
import CaseChart from "./Revenue/CaseChart";
import UsageChart from "./Revenue/UsageChart";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS  = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  { value: 1,  label: "January" },  { value: 2,  label: "February" },
  { value: 3,  label: "March" },    { value: 4,  label: "April" },
  { value: 5,  label: "May" },      { value: 6,  label: "June" },
  { value: 7,  label: "July" },     { value: 8,  label: "August" },
  { value: 9,  label: "September" },{ value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];
const daysInMonth = (y, m) => y && m ? new Date(y, m, 0).getDate() : 31;

const BookingRevenuePanel = () => {
  const dispatch = useDispatch();

  const [year,  setYear]  = useState("");
  const [month, setMonth] = useState("");
  const [day,   setDay]   = useState("");

  const [allLogs,  setAllLogs]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRevenue = useCallback(() => {
    setLoading(true);
    dispatch(getBookingRevenue({
      year:  year  || undefined,
      month: month || undefined,
      day:   day   || undefined,
      page:  1,
      limit: 1000,
    }))
      .then((res) => {
        if (res?.payload?.success) {
          const mapped = res.payload.logs.map((a) => ({
            id:            a._id,
            customerName:  a.customerId?.fullName || "",
            serviceName:   a.serviceName          || "",
            status:        a.status               || "",
            paymentStatus: a.paymentStatus        || "",
            totalAmount:   a.totalAmount          ?? 0,
            _date:         a.appointmentDate,
          }));
          setAllLogs(mapped);
          setFiltered(mapped);
          setTotalCount(res.payload.totalCount);
        }
      })
      .finally(() => setLoading(false));
  }, [dispatch, year, month, day]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const handleYearChange  = (v) => { setYear(v);  setDay(""); };
  const handleMonthChange = (v) => { setMonth(v); setDay(""); };
  const handleClear = () => { setYear(""); setMonth(""); setDay(""); };

  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  // Derived summary from filtered rows
  const fRevenue  = filtered.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const fPaid     = filtered.filter((l) => l.paymentStatus === "paid").reduce((s, l) => s + (l.totalAmount || 0), 0);
  const fPending  = filtered.filter((l) => l.paymentStatus === "pending").reduce((s, l) => s + (l.totalAmount || 0), 0);
  const fCompleted = filtered.filter((l) => l.status === "completed").length;
  const fCancelled = filtered.filter((l) => l.status === "cancelled").length;

  const summaryCards = [
    { label: "Total Revenue",    value: `₹${fRevenue.toFixed(2)}`,  bg: "bg-green-100",  icon: <AttachMoneyIcon sx={{ color: "#1B5E20" }} /> },
    { label: "Paid Amount",      value: `₹${fPaid.toFixed(2)}`,     bg: "bg-blue-100",   icon: <TrendingUpIcon  sx={{ color: "#1565C0" }} /> },
    { label: "Pending Amount",   value: `₹${fPending.toFixed(2)}`,  bg: "bg-orange-100", icon: <ReceiptLongIcon sx={{ color: "#E65100" }} /> },
    { label: "Completed",        value: fCompleted,                  bg: "bg-emerald-100",icon: <CheckCircleIcon sx={{ color: "#1B5E20" }} /> },
    { label: "Cancelled",        value: fCancelled,                  bg: "bg-red-100",    icon: <CancelIcon      sx={{ color: "#B71C1C" }} /> },
  ];

  // Revenue over time (line chart)
  const revenueChartData = Object.values(
    filtered.reduce((acc, l) => {
      const date = new Date(l._date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!acc[date]) acc[date] = { date, revenue: 0, profit: 0 };
      acc[date].revenue = parseFloat((acc[date].revenue + (l.totalAmount || 0)).toFixed(2));
      acc[date].profit  = parseFloat((acc[date].profit  + (l.paymentStatus === "paid" ? l.totalAmount : 0)).toFixed(2));
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Revenue by service (pie chart — reusing CaseChart)
  const serviceChartData = Object.values(
    filtered.reduce((acc, l) => {
      const key = l.serviceName || "Other";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value = parseFloat((acc[key].value + (l.totalAmount || 0)).toFixed(2));
      return acc;
    }, {})
  ).filter((d) => d.value > 0);

  // Bookings count over time (bar chart — reusing UsageChart)
  const bookingsCountData = Object.values(
    filtered.reduce((acc, l) => {
      const date = new Date(l._date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!acc[date]) acc[date] = { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg border border-[#85A947]/20 p-6">

      {/* Panel Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUpIcon sx={{ color: "#1B5E20", fontSize: 30 }} />
        <h3 className="text-2xl font-bold text-[#123524]">Booking Revenue Analytics</h3>
      </div>

      {/* Date Filters */}
      <div className="bg-[#f9f9f9] rounded-2xl p-5 border border-[#85A947]/20 mb-6">
        <p className="text-sm font-semibold text-[#3E7B27] mb-3">Filter by Date</p>
        <div className="flex flex-wrap gap-4 items-center">
          <TextField select label="Year" value={year} onChange={(e) => handleYearChange(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value="">All Years</MenuItem>
            {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField select label="Month" value={month} onChange={(e) => handleMonthChange(e.target.value)} sx={{ minWidth: 140 }} disabled={!year}>
            <MenuItem value="">All Months</MenuItem>
            {MONTHS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>
          <TextField select label="Day" value={day} onChange={(e) => setDay(e.target.value)} sx={{ minWidth: 110 }} disabled={!year || !month}>
            <MenuItem value="">All Days</MenuItem>
            {dayOptions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          {(year || month || day) && (
            <Button variant="outlined" color="error" onClick={handleClear} sx={{ textTransform: "none", borderRadius: "8px" }}>
              Clear Filters
            </Button>
          )}
          <span className="text-sm text-gray-400 ml-auto">
            {loading ? "Loading..." : `${totalCount} record${totalCount !== 1 ? "s" : ""} found`}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center flex-shrink-0`}>{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-[#123524]">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
          <p className="text-base font-semibold text-[#123524] mb-4">Revenue & Paid Amount Over Time</p>
          {revenueChartData.length > 0
            ? <RevenueChart data={revenueChartData} />
            : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
        </div>
        <div className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
          <p className="text-base font-semibold text-[#123524] mb-4">Revenue by Service</p>
          {serviceChartData.length > 0
            ? <CaseChart data={serviceChartData} />
            : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
          <p className="text-base font-semibold text-[#123524] mb-4">Bookings Count by Date</p>
          {bookingsCountData.length > 0
            ? <UsageChart data={bookingsCountData} />
            : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
        </div>
      </div>

    </div>
  );
};

export default BookingRevenuePanel;
