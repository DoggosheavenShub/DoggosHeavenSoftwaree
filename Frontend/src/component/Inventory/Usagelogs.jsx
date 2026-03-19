import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUsageLogs } from "../../store/slices/inventorySlice";
import { Link } from "react-router-dom";
import Navbar from "../navbar";

import { DataGrid } from "@mui/x-data-grid";
import {
  Box, Button, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";

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
  "& .MuiDataGrid-row": { backgroundColor: "transparent" },
  "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(133,169,71,0.1)" },
  "& .MuiDataGrid-footerContainer": { background: "#fff" },
};

// ── View Detail Dialog ─────────────────────────────────────────────────────────
const ViewLogDialog = ({ open, onClose, log }) => {
  if (!log) return null;
  const fields = [
    { label: "Item Name",      value: log.medicineName },
    { label: "Quantity Used",  value: `${log.quantityUsed}` },
    { label: "Pet Name",       value: log.petName },
    { label: "Booking ID",     value: log.bookingId },
    { label: "Used By",        value: log.usedBy },
    { label: "Case Type",      value: log.caseType },
    { label: "Cost Price",     value: log.costPrice != null ? `₹${log.costPrice}` : "—" },
    { label: "Sell Price",     value: log.sellPrice != null ? `₹${log.sellPrice}` : "—" },
    { label: "Total Amount",   value: log.totalAmount != null ? `₹${log.totalAmount}` : "—" },
    { label: "Profit",         value: log.profit != null ? `₹${log.profit}` : "—" },
    { label: "Payment Status", value: log.paymentStatus || "—" },
    { label: "Date",           value: new Date(log.createdAt).toLocaleString() },
    { label: "Notes",          value: log.notes || "—" },
  ];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <DialogTitle sx={{ background: "linear-gradient(to right, #1B5E20, #2E7D32)", color: "#fff", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VisibilityIcon /> Usage Log Details
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ background: "#fff", pt: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {fields.map((f) => (
            <Box key={f.label} display="flex" justifyContent="space-between" alignItems="flex-start"
              sx={{ px: 2, py: 1.5, borderRadius: "10px", background: "linear-gradient(to right, #f9f9f9, rgba(239,227,194,0.3))", border: "1px solid rgba(133,169,71,0.2)" }}>
              <span style={{ fontWeight: "600", color: "#555", fontSize: "14px", minWidth: 130 }}>{f.label}</span>
              <span style={{ color: f.label === "Profit" && log.profit < 0 ? "#B71C1C" : "#1B5E20", fontWeight: "500", fontSize: "14px", textAlign: "right" }}>{f.value}</span>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ background: "#fff", px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained"
          sx={{ background: "linear-gradient(to right, #1B5E20, #2E7D32)", borderRadius: "8px", textTransform: "none", fontWeight: "bold", "&:hover": { background: "linear-gradient(to right, #2E7D32, #388E3C)" } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const UsageLogs = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [initialLogs, setInitialLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewLog, setViewLog] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    dispatch(getUsageLogs()).then((res) => {
      if (res?.payload?.success) {
        const formatted = res.payload.logs.map((log) => ({ ...log, id: log._id }));
        setLogs(formatted);
        setInitialLogs(formatted);
      }
    });
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      setLogs(initialLogs.filter((log) =>
        log.medicineName?.toLowerCase().includes(q) ||
        log.petName?.toLowerCase().includes(q) ||
        log.usedBy?.toLowerCase().includes(q) ||
        log.bookingId?.toLowerCase().includes(q)
      ));
    } else {
      setLogs(initialLogs);
    }
  }, [searchTerm, initialLogs]);

  const columns = [
    { field: "medicineName",  headerName: "Item Name",    flex: 1.2, renderCell: (p) => <span style={{ fontWeight: "600", color: "#123524" }}>{p.row.medicineName}</span> },
    { field: "quantityUsed",  headerName: "Qty Used",     flex: 0.7, renderCell: (p) => <Chip label={p.row.quantityUsed} size="small" sx={{ backgroundColor: "rgba(27,94,32,0.1)", color: "#1B5E20", fontWeight: "bold" }} /> },
    { field: "petName",       headerName: "Pet Name",     flex: 0.9, renderCell: (p) => <Chip label={p.row.petName} size="small" sx={{ backgroundColor: "rgba(21,101,192,0.1)", color: "#1565C0", fontWeight: "bold" }} /> },
    { field: "bookingId",     headerName: "Booking ID",   flex: 0.9, renderCell: (p) => <span style={{ color: "#555" }}>{p.row.bookingId}</span> },
    { field: "usedBy",        headerName: "Used By",      flex: 1,   renderCell: (p) => <span style={{ color: "#333" }}>{p.row.usedBy}</span> },
    { field: "caseType",      headerName: "Case Type",    flex: 0.8, renderCell: (p) => <Chip label={p.row.caseType || "—"} size="small" sx={{ backgroundColor: p.row.caseType === "NGO" ? "rgba(230,81,0,0.1)" : "rgba(21,101,192,0.1)", color: p.row.caseType === "NGO" ? "#E65100" : "#1565C0", fontWeight: "bold" }} /> },
    { field: "costPrice",     headerName: "Cost Price",   flex: 0.8, renderCell: (p) => <span style={{ color: "#555" }}>{p.row.costPrice != null ? `₹${p.row.costPrice}` : "—"}</span> },
    { field: "sellPrice",     headerName: "Sell Price",   flex: 0.8, renderCell: (p) => <span style={{ color: "#1B5E20", fontWeight: "500" }}>{p.row.sellPrice != null ? `₹${p.row.sellPrice}` : "—"}</span> },
    { field: "totalAmount",   headerName: "Total Amount", flex: 0.9, renderCell: (p) => <span style={{ fontWeight: "600", color: "#123524" }}>{p.row.totalAmount != null ? `₹${p.row.totalAmount}` : "—"}</span> },
    { field: "profit",        headerName: "Profit",       flex: 0.8, renderCell: (p) => { const v = p.row.profit; return <span style={{ fontWeight: "bold", color: v == null ? "#555" : v >= 0 ? "#1B5E20" : "#B71C1C" }}>{v != null ? `₹${v}` : "—"}</span>; } },
    { field: "paymentStatus", headerName: "Payment",      flex: 0.8, renderCell: (p) => <Chip label={p.row.paymentStatus || "—"} size="small" sx={{ backgroundColor: p.row.paymentStatus === "Paid" ? "rgba(27,94,32,0.12)" : "rgba(183,28,28,0.1)", color: p.row.paymentStatus === "Paid" ? "#1B5E20" : "#B71C1C", fontWeight: "bold" }} /> },
    { field: "createdAt",     headerName: "Date",         flex: 0.8, renderCell: (p) => <span style={{ color: "#555", fontSize: "13px" }}>{new Date(p.row.createdAt).toLocaleDateString()}</span> },
    { field: "actions",       headerName: "Actions",      flex: 0.7, sortable: false, filterable: false,
      renderCell: (p) => (
        <Button variant="contained" size="small" startIcon={<VisibilityIcon />}
          onClick={() => { setViewLog(p.row); setViewOpen(true); }}
          sx={{ textTransform: "none", fontWeight: "bold", background: "linear-gradient(to right, #1565C0, #1976D2)", borderRadius: "8px", "&:hover": { background: "linear-gradient(to right, #1976D2, #1E88E5)" } }}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-full mx-auto px-6 py-2">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <BarChartIcon sx={{ color: "#E65100", fontSize: 32 }} />
              <h2 className="text-3xl font-bold text-[#123524]">Usage Logs</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/staff/inventoryList"><Button variant="outlined" color="success">Inventory List</Button></Link>
              <Link to="/staff/alertlist"><Button variant="outlined" color="warning">Alert List</Button></Link>
              <Link to="/staff/revenue">
                <Button variant="contained" sx={{ background: "linear-gradient(to right, #1565C0, #1976D2)", textTransform: "none", fontWeight: "bold", borderRadius: "8px", "&:hover": { background: "linear-gradient(to right, #1976D2, #1E88E5)" } }}>
                  View Revenue
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <BarChartIcon sx={{ color: "#1B5E20" }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold text-[#123524]">{logs.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-5 border border-[#85A947]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <VisibilityIcon sx={{ color: "#1565C0" }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unique Items</p>
                <p className="text-2xl font-bold text-[#123524]">{new Set(logs.map((l) => l.medicineName)).size}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <TextField fullWidth label="Search by item, pet, staff, or booking ID..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* DataGrid */}
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={logs}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              autoHeight
              disableRowSelectionOnClick
              showToolbar
              sx={GRID_SX}
            />
          </Box>

        </div>
      </div>

      <ViewLogDialog open={viewOpen} onClose={() => setViewOpen(false)} log={viewLog} />
    </>
  );
};

export default UsageLogs;
