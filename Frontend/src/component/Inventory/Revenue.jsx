import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getRevenue } from "../../store/slices/inventorySlice";
import { Link } from "react-router-dom";
import Navbar from "../navbar";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, TextField, Chip, MenuItem } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RevenueChart from "../Revenue/Revenuechart";
import CaseChart from "../Revenue/CaseChart";
import UsageChart from "../Revenue/UsageChart";

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
const daysInMonth = (year, month) => year && month ? new Date(year, month, 0).getDate() : 31;

const GRID_SX = {
  background: "#fff",
  border: "none",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(18,53,36,0.08)",
  "& .MuiDataGrid-scrollbar": { display: "none" },
  "& .MuiDataGrid-toolbarContainer": {
    backgroundColor: "transparent", padding: "8px 16px",
    borderBottom: "1px solid rgba(27,94,32,0.3)",
  },
  "& .MuiDataGrid-toolbarContainer .MuiButton-root": { color: "#1B5E20", fontWeight: "bold", fontSize: "13px" },
  "& .MuiDataGrid-columnHeader": { backgroundColor: "#1B5E20", color: "#fff", fontSize: "14px", fontWeight: "bold" },
  "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold", color: "#fff" },
  "& .MuiDataGrid-columnSeparator": { color: "#fff" },
  "& .MuiDataGrid-iconButtonContainer .MuiIconButton-root": {
    color: "#1B5E20", backgroundColor: "#fff", borderRadius: "50%", padding: "2px",
    "&:hover": { backgroundColor: "#e0e0e0" },
  },
  "& .MuiDataGrid-virtualScroller": { background: "#fff" },
  "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(133,169,71,0.1)" },
  "& .MuiDataGrid-footerContainer": { background: "#fff" },
};

const Revenue = () => {
  const dispatch = useDispatch();

  const [year,  setYear]  = useState("");
  const [month, setMonth] = useState("");
  const [day,   setDay]   = useState("");

  const [caseFilter,    setCaseFilter]    = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [searchTerm,    setSearchTerm]    = useState("");

  const [allLogs,  setAllLogs]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [summary,  setSummary]  = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0, totalPaid: 0, totalPending: 0 });
  const [loading,  setLoading]  = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const fetchRevenue = useCallback(() => {
    setLoading(true);
    dispatch(getRevenue({
      year:  year  || undefined,
      month: month || undefined,
      day:   day   || undefined,
      page:  paginationModel.page + 1,
      limit: paginationModel.pageSize,
    }))
      .then((res) => {
        if (res?.payload?.success) {
          setAllLogs(res.payload.logs.map((l) => ({ ...l, id: l._id })));
          setTotalCount(res.payload.totalCount);
          setSummary(res.payload.summary);
        }
      })
      .finally(() => setLoading(false));
  }, [dispatch, year, month, day, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  useEffect(() => {
    let result = allLogs;
    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((l) =>
        l.medicineName?.toLowerCase().includes(q) ||
        l.petName?.toLowerCase().includes(q) ||
        l.bookingId?.toLowerCase().includes(q) ||
        l.usedBy?.toLowerCase().includes(q)
      );
    }
    if (caseFilter    !== "All") result = result.filter((l) => l.caseType      === caseFilter);
    if (paymentFilter !== "All") result = result.filter((l) => l.paymentStatus === paymentFilter);
    setFiltered(result);
  }, [allLogs, searchTerm, caseFilter, paymentFilter]);

  const handleYearChange  = (v) => { setYear(v);  setDay(""); setPaginationModel((p) => ({ ...p, page: 0 })); };
  const handleMonthChange = (v) => { setMonth(v); setDay(""); setPaginationModel((p) => ({ ...p, page: 0 })); };
  const handleClear = () => { setYear(""); setMonth(""); setDay(""); setPaginationModel((p) => ({ ...p, page: 0 })); };

  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  const fRevenue = filtered.reduce((s, l) => s + (l.totalAmount || 0), 0);
  const fCost    = filtered.reduce((s, l) => s + (l.costPrice   || 0), 0);
  const fProfit  = filtered.reduce((s, l) => s + (l.profit      || 0), 0);
  const fPaid    = filtered.filter((l) => l.paymentStatus === "Paid").reduce((s, l) => s + (l.totalAmount || 0), 0);
  const fPending = filtered.filter((l) => l.paymentStatus === "Pending").reduce((s, l) => s + (l.totalAmount || 0), 0);

  const summaryCards = [
    { label: "Total Revenue",  value: `₹${fRevenue.toFixed(2)}`,  bg: "bg-green-100",   icon: <AttachMoneyIcon sx={{ color: "#1B5E20" }} /> },
    { label: "Total Cost",     value: `₹${fCost.toFixed(2)}`,     bg: "bg-red-100",     icon: <ReceiptLongIcon sx={{ color: "#B71C1C" }} /> },
    { label: "Total Profit",   value: `₹${fProfit.toFixed(2)}`,   bg: "bg-emerald-100", icon: <TrendingUpIcon  sx={{ color: "#1B5E20" }} /> },
    { label: "Paid Amount",    value: `₹${fPaid.toFixed(2)}`,     bg: "bg-blue-100",    icon: <AttachMoneyIcon sx={{ color: "#1565C0" }} /> },
    { label: "Pending Amount", value: `₹${fPending.toFixed(2)}`,  bg: "bg-orange-100",  icon: <BarChartIcon    sx={{ color: "#E65100" }} /> },
  ];

  const columns = [
    { field: "medicineName", headerName: "Item Name",    flex: 1.2, renderCell: (p) => <span style={{ fontWeight: "600", color: "#123524" }}>{p.row.medicineName}</span> },
    { field: "petName",      headerName: "Pet Name",     flex: 1,   renderCell: (p) => <Chip label={p.row.petName} size="small" sx={{ backgroundColor: "rgba(21,101,192,0.1)", color: "#1565C0", fontWeight: "bold" }} /> },
    { field: "bookingId",    headerName: "Booking ID",   flex: 0.9, renderCell: (p) => <span style={{ color: "#555" }}>{p.row.bookingId}</span> },
    {
      field: "caseType", headerName: "Case Type", flex: 0.8,
      renderCell: (p) => <Chip label={p.row.caseType || "—"} size="small" sx={{ backgroundColor: p.row.caseType === "NGO" ? "rgba(230,81,0,0.1)" : "rgba(21,101,192,0.1)", color: p.row.caseType === "NGO" ? "#E65100" : "#1565C0", fontWeight: "bold" }} />,
    },
    { field: "quantityUsed", headerName: "Qty",          flex: 0.6, renderCell: (p) => <span style={{ color: "#555" }}>{p.row.quantityUsed}</span> },
    { field: "costPrice",    headerName: "Cost Price",   flex: 0.8, renderCell: (p) => <span style={{ color: "#555" }}>₹{p.row.costPrice ?? "—"}</span> },
    { field: "sellPrice",    headerName: "Sell Price",   flex: 0.8, renderCell: (p) => <span style={{ color: "#1B5E20", fontWeight: "500" }}>₹{p.row.sellPrice ?? "—"}</span> },
    { field: "totalAmount",  headerName: "Total Amount", flex: 0.9, renderCell: (p) => <span style={{ fontWeight: "600", color: "#123524" }}>₹{p.row.totalAmount ?? "—"}</span> },
    {
      field: "profit", headerName: "Profit", flex: 0.8,
      renderCell: (p) => { const v = p.row.profit; return <span style={{ fontWeight: "bold", color: v == null ? "#555" : v >= 0 ? "#1B5E20" : "#B71C1C" }}>{v != null ? `₹${v}` : "—"}</span>; },
    },
    {
      field: "paymentStatus", headerName: "Payment", flex: 0.8,
      renderCell: (p) => <Chip label={p.row.paymentStatus || "—"} size="small" sx={{ backgroundColor: p.row.paymentStatus === "Paid" ? "rgba(27,94,32,0.12)" : "rgba(183,28,28,0.1)", color: p.row.paymentStatus === "Paid" ? "#1B5E20" : "#B71C1C", fontWeight: "bold" }} />,
    },
    { field: "usedBy",    headerName: "Used By", flex: 1,   renderCell: (p) => <span style={{ color: "#333" }}>{p.row.usedBy}</span> },
    { field: "createdAt", headerName: "Date",    flex: 0.8, renderCell: (p) => <span style={{ color: "#555", fontSize: "13px" }}>{new Date(p.row.createdAt).toLocaleDateString()}</span> },
  ];

  const revenueChartData = Object.values(
    filtered.reduce((acc, l) => {
      const date = new Date(l.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!acc[date]) acc[date] = { date, revenue: 0, profit: 0 };
      acc[date].revenue = parseFloat((acc[date].revenue + (l.totalAmount || 0)).toFixed(2));
      acc[date].profit  = parseFloat((acc[date].profit  + (l.profit      || 0)).toFixed(2));
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const caseChartData = [
    { name: "Customer", value: parseFloat(filtered.filter((l) => l.caseType === "Customer").reduce((s, l) => s + (l.totalAmount || 0), 0).toFixed(2)) },
    { name: "NGO",      value: parseFloat(filtered.filter((l) => l.caseType === "NGO")     .reduce((s, l) => s + (l.totalAmount || 0), 0).toFixed(2)) },
  ].filter((d) => d.value > 0);

  const usageChartData = Object.values(
    filtered.reduce((acc, l) => {
      const date = new Date(l.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!acc[date]) acc[date] = { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-full mx-auto px-6 py-2">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <TrendingUpIcon sx={{ color: "#1B5E20", fontSize: 32 }} />
              <h2 className="text-3xl font-bold text-[#123524]">Revenue & Payments</h2>
            </div>
            <Link to="/staff/usagelogs">
              <Button variant="outlined" color="success">Back to Usage Logs</Button>
            </Link>
          </div>

          {/* Date Filters */}
          <div className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20 mb-6">
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
                <Button variant="outlined" color="error" onClick={handleClear} sx={{ textTransform: "none", borderRadius: "8px" }}>Clear Filters</Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
              <p className="text-base font-semibold text-[#123524] mb-4">Revenue & Profit Over Time</p>
              {revenueChartData.length > 0 ? <RevenueChart data={revenueChartData} /> : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
            </div>
            <div className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
              <p className="text-base font-semibold text-[#123524] mb-4">Revenue by Case Type</p>
              {caseChartData.length > 0 ? <CaseChart data={caseChartData} /> : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
            </div>
            <div className="lg:col-span-3 bg-white rounded-2xl shadow p-5 border border-[#85A947]/20">
              <p className="text-base font-semibold text-[#123524] mb-4">Medicine Usage Count by Date</p>
              {usageChartData.length > 0 ? <UsageChart data={usageChartData} /> : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No data for selected period</div>}
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <TextField label="Search by item, pet, booking, staff..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} sx={{ flex: 1, minWidth: 240 }} />
            <TextField select label="Case Type" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="NGO">NGO</MenuItem>
            </TextField>
            <TextField select label="Payment Status" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
          </div>

          {/* DataGrid */}
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              rowCount={totalCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50]}
              autoHeight
              disableRowSelectionOnClick
              showToolbar
              loading={loading}
              sx={GRID_SX}
            />
          </Box>

        </div>
      </div>
    </>
  );
};

export default Revenue;
