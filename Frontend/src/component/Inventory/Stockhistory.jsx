import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getStockHistory } from "../../store/slices/inventorySlice";
import { Link } from "react-router-dom";
import Navbar from "../navbar";

import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import TuneIcon from "@mui/icons-material/Tune";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// ── Dummy Data ─────────────────────────────────────────────────────────────────
const DUMMY_STOCK_HISTORY = [
  {
    _id: "1",
    actionType: "Added",
    itemName: "Amoxicillin",
    quantity: 50,
    unit: "tablet",
    staff: "Dr. Priya Sharma",
    date: "2026-03-01T09:00:00Z",
    notes: "New stock received from supplier.",
    previousStock: 10,
    currentStock: 60,
  },
  {
    _id: "2",
    actionType: "Used",
    itemName: "Ivermectin",
    quantity: 5,
    unit: "ml",
    staff: "Dr. Ravi Mehta",
    date: "2026-03-05T11:30:00Z",
    notes: "Used for Bruno's anti-parasitic treatment.",
    previousStock: 30,
    currentStock: 25,
  },
  {
    _id: "3",
    actionType: "Adjusted",
    itemName: "Bandage Roll",
    quantity: -3,
    unit: "piece",
    staff: "Staff: Anjali",
    date: "2026-03-07T14:00:00Z",
    notes: "Damaged items removed from stock.",
    previousStock: 20,
    currentStock: 17,
  },
  {
    _id: "4",
    actionType: "Added",
    itemName: "Saline Solution",
    quantity: 100,
    unit: "ml",
    staff: "Admin",
    date: "2026-03-08T08:30:00Z",
    notes: "Monthly restocking.",
    previousStock: 200,
    currentStock: 300,
  },
  {
    _id: "5",
    actionType: "Used",
    itemName: "Dexamethasone",
    quantity: 10,
    unit: "mg",
    staff: "Dr. Priya Sharma",
    date: "2026-03-10T10:00:00Z",
    notes: "Administered to Max for inflammation.",
    previousStock: 50,
    currentStock: 40,
  },
  {
    _id: "6",
    actionType: "Adjusted",
    itemName: "Amoxicillin",
    quantity: 5,
    unit: "tablet",
    staff: "Admin",
    date: "2026-03-11T09:15:00Z",
    notes: "Stock count correction after audit.",
    previousStock: 60,
    currentStock: 65,
  },
  {
    _id: "7",
    actionType: "Used",
    itemName: "Bandage Roll",
    quantity: 2,
    unit: "piece",
    staff: "Staff: Anjali",
    date: "2026-03-12T15:00:00Z",
    notes: "Post-surgery dressing for Charlie.",
    previousStock: 17,
    currentStock: 15,
  },
  {
    _id: "8",
    actionType: "Added",
    itemName: "Ivermectin",
    quantity: 20,
    unit: "ml",
    staff: "Admin",
    date: "2026-03-13T08:00:00Z",
    notes: "Emergency restock.",
    previousStock: 25,
    currentStock: 45,
  },
];

// ── Action type config ─────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  Added:    { color: "#1B5E20", bg: "rgba(27,94,32,0.1)",    icon: <AddCircleIcon fontSize="small" />,    label: "Added"    },
  Used:     { color: "#C62828", bg: "rgba(198,40,40,0.1)",   icon: <RemoveCircleIcon fontSize="small" />, label: "Used"     },
  Adjusted: { color: "#E65100", bg: "rgba(230,81,0,0.1)",    icon: <TuneIcon fontSize="small" />,         label: "Adjusted" },
};

// ── Row Action Menu ────────────────────────────────────────────────────────────
const RowActionMenu = ({ row, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          backgroundColor: "#1B5E20",
          color: "#fff",
          borderRadius: "8px",
          padding: "4px 8px",
          "&:hover": { backgroundColor: "#2E7D32" },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            minWidth: 160,
            border: "1px solid rgba(27,94,32,0.15)",
          },
        }}
      >
        <MenuItem onClick={() => { onView(row); setAnchorEl(null); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" sx={{ color: "#1565C0" }} /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

// ── View Detail Dialog ─────────────────────────────────────────────────────────
const ViewDialog = ({ open, onClose, log }) => {
  if (!log) return null;

  const cfg = ACTION_CONFIG[log.actionType] || ACTION_CONFIG.Added;

  const fields = [
    { label: "Action Type",     value: log.actionType },
    { label: "Item Name",       value: log.itemName },
    { label: "Quantity",        value: `${Math.abs(log.quantity)} ${log.unit}` },
    { label: "Staff",           value: log.staff },
    { label: "Date & Time",     value: new Date(log.createdAt).toLocaleString() },
    { label: "Previous Stock",  value: `${log.previousStock} ${log.unit}` },
    { label: "Current Stock",   value: `${log.currentStock} ${log.unit}` },
    { label: "Notes",           value: log.notes || "—" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(to right, #1565C0, #1976D2)",
          color: "#fff",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HistoryIcon />
          Stock History Details
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ background: "#fff", pt: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {fields.map((f) => (
            <Box
              key={f.label}
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                background: "linear-gradient(to right, #f9f9f9, rgba(239,227,194,0.3))",
                border: "1px solid rgba(133,169,71,0.2)",
              }}
            >
              <span style={{ fontWeight: "600", color: "#555", fontSize: "14px", minWidth: 130 }}>
                {f.label}
              </span>
              {f.label === "Action Type" ? (
                <Chip
                  label={f.value}
                  size="small"
                  icon={cfg.icon}
                  sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: "bold" }}
                />
              ) : (
                <span style={{ color: "#1B5E20", fontWeight: "500", fontSize: "14px", textAlign: "right" }}>
                  {f.value}
                </span>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ background: "#fff", px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #1565C0, #1976D2)",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const StockHistory = () => {
  const dispatch = useDispatch();
  const [logs, setLogs]               = useState([]);
  const [initialLogs, setInitialLogs] = useState([]);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState("All");
  const [viewLog, setViewLog]         = useState(null);
  const [viewOpen, setViewOpen]       = useState(false);

  useEffect(() => {
    dispatch(getStockHistory()).then((res) => {
      if (res?.payload?.success) {
        const formatted = res.payload.history.map((l) => ({ ...l, id: l._id }));
        setLogs(formatted);
        setInitialLogs(formatted);
      }
    });
  }, []);

  useEffect(() => {
    let filtered = initialLogs;

    if (filterType !== "All") {
      filtered = filtered.filter((l) => l.actionType === filterType);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.itemName.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          l.staff.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }
    setLogs(filtered);
  }, [searchTerm, filterType, initialLogs]);

  const columns = [
    {
      field: "actionType",
      headerName: "Action",
      flex: 0.8,
      renderCell: (params) => {
        const cfg = ACTION_CONFIG[params.row.actionType] || ACTION_CONFIG.Added;
        return (
          <Chip
            label={cfg.label}
            size="small"
            icon={React.cloneElement(cfg.icon, { style: { color: cfg.color } })}
            sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: "bold", fontSize: "12px" }}
          />
        );
      },
    },
    {
      field: "itemName",
      headerName: "Item",
      flex: 1.2,
      renderCell: (params) => (
        <span style={{ fontWeight: "600", color: "#123524" }}>{params.row.itemName}</span>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0.8,
      renderCell: (params) => {
        const qty = params.row.quantity;
        const isNegative = qty < 0;
        return (
          <span style={{
            fontWeight: "bold",
            color: params.row.actionType === "Used" ? "#C62828" : params.row.actionType === "Added" ? "#1B5E20" : "#E65100",
          }}>
            {params.row.actionType === "Used" ? "-" : "+"}{Math.abs(qty)} {params.row.unit}
          </span>
        );
      },
    },
    {
      field: "staff",
      headerName: "Staff",
      flex: 1.2,
      renderCell: (params) => (
        <span style={{ color: "#333", fontWeight: "500" }}>{params.row.staff}</span>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#555", fontSize: "13px" }}>
          {new Date(params.row.createdAt).toLocaleDateString()}{" "}
          <span style={{ color: "#999" }}>
            {new Date(params.row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </span>
      ),
    },
    {
      field: "menu",
      headerName: "Action Menu",
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <RowActionMenu row={params.row} onView={(row) => { setViewLog(row); setViewOpen(true); }} />
      ),
    },
  ];

  const totalAdded    = initialLogs.filter((l) => l.actionType === "Added").length;
  const totalUsed     = initialLogs.filter((l) => l.actionType === "Used").length;
  const totalAdjusted = initialLogs.filter((l) => l.actionType === "Adjusted").length;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-7xl mx-auto p-6">

          {/* ── Header ── */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <HistoryIcon sx={{ color: "#1565C0", fontSize: 32 }} />
              <h2 className="text-3xl font-bold text-[#123524]">Stock History</h2>
            </div>
            <div className="flex gap-3">
              <Link to="/staff/inventorylist">
                <Button variant="outlined" color="success">Inventory List</Button>
              </Link>
              <Link to="/staff/usagelogs">
                <Button variant="outlined" color="warning">Usage Logs</Button>
              </Link>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Records", value: initialLogs.length,  color: "#1565C0", bg: "bg-blue-50"   },
              { label: "Added",         value: totalAdded,           color: "#1B5E20", bg: "bg-green-50"  },
              { label: "Used",          value: totalUsed,            color: "#C62828", bg: "bg-red-50"    },
              { label: "Adjusted",      value: totalAdjusted,        color: "#E65100", bg: "bg-orange-50" },
            ].map((card) => (
              <div
                key={card.label}
                className={`${card.bg} rounded-2xl shadow p-5 border border-white flex items-center gap-4`}
              >
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filter + Search ── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <TextField
              fullWidth
              label="Search by item or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Box display="flex" gap={1} flexShrink={0}>
              {["All", "Added", "Used", "Adjusted"].map((type) => {
                const cfg = type === "All"
                  ? { color: "#1565C0", bg: "rgba(21,101,192,0.1)" }
                  : ACTION_CONFIG[type];
                const isActive = filterType === type;
                return (
                  <Button
                    key={type}
                    variant={isActive ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setFilterType(type)}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: "bold",
                      minWidth: 80,
                      ...(isActive
                        ? { backgroundColor: cfg.color, color: "#fff", "&:hover": { backgroundColor: cfg.color } }
                        : { borderColor: cfg.color, color: cfg.color }),
                    }}
                  >
                    {type}
                  </Button>
                );
              })}
            </Box>
          </div>

          {/* ── DataGrid ── */}
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={logs}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              showToolbar
              sx={{
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(18,53,36,0.08)",
                border: "1px solid rgba(133,169,71,0.2)",

                "& .MuiDataGrid-toolbarContainer": {
                  backgroundColor: "transparent",
                  padding: "8px 16px",
                  borderBottom: "1px solid rgba(27,94,32,0.3)",
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-root": {
                  color: "#1B5E20",
                  fontWeight: "bold",
                  fontSize: "13px",
                },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1B5E20", color: "#fff" },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#1B5E20",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold", color: "#fff" },
                "& .MuiDataGrid-columnSeparator": { color: "#fff" },
                "& .MuiDataGrid-iconButtonContainer .MuiIconButton-root": {
                  color: "#1B5E20",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  padding: "2px",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                },
                "& .MuiDataGrid-virtualScroller": { background: "#fff" },
                "& .MuiDataGrid-row": { backgroundColor: "transparent" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(133,169,71,0.1)" },
                "& .MuiDataGrid-footerContainer": { background: "#fff" },
              }}
            />
          </Box>

        </div>
      </div>

      {/* View Dialog */}
      <ViewDialog open={viewOpen} onClose={() => setViewOpen(false)} log={viewLog} />
    </>
  );
};

export default StockHistory;