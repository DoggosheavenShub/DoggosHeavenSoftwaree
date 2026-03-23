import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import {
  getAllInventory,
  deleteInventoryItem,
} from "../../store/slices/inventorySlice";

import Navbar from "../navbar";

// ── Stock History Dialog ───────────────────────────────────────────────────────
const StockHistoryDialog = ({ open, onClose }) => (
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
        Stock History
      </Box>
      <IconButton onClick={onClose} sx={{ color: "#fff" }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ background: "#fff", pt: 3 }}>
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          border: "2px dashed rgba(21,101,192,0.3)",
          borderRadius: "12px",
          background: "rgba(21,101,192,0.04)",
        }}
      >
        <HistoryIcon sx={{ fontSize: 48, color: "#90CAF9", mb: 1 }} />
        <p style={{ fontWeight: "600", color: "#1565C0" }}>No stock history yet</p>
        <p style={{ fontSize: "13px", color: "#aaa", marginTop: 4 }}>
          Stock changes across all inventory items will appear here.
        </p>
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

// ── Usage Logs Dialog ──────────────────────────────────────────────────────────
const UsageLogsDialog = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
  >
    <DialogTitle
      sx={{
        background: "linear-gradient(to right, #E65100, #F57C00)",
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
        <BarChartIcon />
        Usage Logs
      </Box>
      <IconButton onClick={onClose} sx={{ color: "#fff" }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ background: "#fff", pt: 3 }}>
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          border: "2px dashed rgba(230,81,0,0.3)",
          borderRadius: "12px",
          background: "rgba(255,152,0,0.04)",
        }}
      >
        <BarChartIcon sx={{ fontSize: 48, color: "#FFB74D", mb: 1 }} />
        <p style={{ fontWeight: "600", color: "#E65100" }}>No usage logs yet</p>
        <p style={{ fontSize: "13px", color: "#aaa", marginTop: 4 }}>
          Usage history across all inventory items will appear here.
        </p>
      </Box>
    </DialogContent>

    <DialogActions sx={{ background: "#fff", px: 3, pb: 2 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          background: "linear-gradient(to right, #E65100, #F57C00)",
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

// ── View Detail Dialog ─────────────────────────────────────────────────────────
const ViewDialog = ({ open, onClose, item }) => {
  if (!item) return null;
  const fields = [
    { label: "Item Name", value: String(item.itemName ?? "—") },
    { label: "Item Type", value: String(item.itemType ?? "—") },
    { label: "Stock", value: `${item.stock} ${item.stockUnit}` },
    { label: "Cost Price", value: `₹${item.unitCostPrice}` },
    { label: "NGO Price", value: `₹${item.unitMinRetailPriceNGO}` },
    { label: "Customer Price", value: `₹${item.unitMaxRetailPriceCustomer}` },
    { label: "Supplier", value: typeof item.supplier === "object" ? (item.supplier?.name || "—") : (item.supplier || "—") },
    { label: "Supplier Contact", value: typeof item.supplier === "object" ? (item.supplier?.contact || "—") : "—" },
    { label: "Supplier Email", value: typeof item.supplier === "object" ? (item.supplier?.email || "—") : "—" },
    { label: "Created", value: new Date(item.createdAt).toLocaleDateString() },
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
          background: "linear-gradient(to right, #1B5E20, #2E7D32)",
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
          <VisibilityIcon />
          Item Details
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
              alignItems="center"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                background: "linear-gradient(to right, #f9f9f9, rgba(239,227,194,0.3))",
                border: "1px solid rgba(133,169,71,0.2)",
              }}
            >
              <span style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>
                {f.label}
              </span>
              <Chip
                label={f.value ?? "—"}
                size="small"
                sx={{
                  backgroundColor: "rgba(27,94,32,0.08)",
                  color: "#1B5E20",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ background: "#fff", px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #1B5E20, #2E7D32)",
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
const InventoryList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getAllInventoryLoading, deleteInventoryLoading } = useSelector(
    (state) => state.inventory
  );

  const [inventory, setInventory] = useState([]);
  const [initialInventory, setInitialInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteItemId, setDeleteItemId] = useState(null);

  const [viewItem, setViewItem] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [stockHistoryOpen, setStockHistoryOpen] = useState(false);
  const [usageLogsOpen, setUsageLogsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    dispatch(getAllInventory())
      .then((data) => {
        if (data?.payload?.success) {
          const formattedData = data.payload.items.map((item) => ({
            ...item,
            id: item._id,
          }));
          setInitialInventory(formattedData);
          setInventory(formattedData);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = initialInventory.filter((item) =>
        item.itemName.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
      setInventory(filtered);
    } else {
      setInventory(initialInventory);
    }
  }, [searchTerm, initialInventory]);

  const handleEdit = (id) => navigate(`/staff/editInventory`, { state: { id } });
  const handleView = (item) => { setViewItem(item); setViewOpen(true); };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setDeleteItemId(id);
      dispatch(deleteInventoryItem(id))
        .then((response) => {
          if (response?.payload?.success) {
            const updated = inventory.filter((item) => item._id !== id);
            setInventory(updated);
            setInitialInventory(updated);
          } else {
            alert("Delete failed!");
          }
        })
        .finally(() => setDeleteItemId(null));
    }
  };

  const columns = [
    { field: "itemId", headerName: "Item ID", minWidth: 100 },
    { field: "itemName", headerName: "Item Name", minWidth: 150 },
    {
      field: "stock",
      headerName: "Stock Unit",
      minWidth: 120,
      renderCell: (params) => (
        <span>{params.row.stock} {params.row.stockUnit}</span>
      ),
    },
    { field: "itemType", headerName: "Type", minWidth: 120 },
    {
      field: "unitCostPrice",
      headerName: "Cost Price",
      minWidth: 110,
      renderCell: (params) => `₹${params.row.unitCostPrice}`,
    },
    {
      field: "unitMinRetailPriceNGO",
      headerName: "NGO Price",
      minWidth: 110,
      renderCell: (params) => `₹${params.row.unitMinRetailPriceNGO}`,
    },
    {
      field: "unitMaxRetailPriceCustomer",
      headerName: "Customer Price",
      minWidth: 130,
      renderCell: (params) => `₹${params.row.unitMaxRetailPriceCustomer}`,
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 110,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: "supplier",
      headerName: "Supplier",
      minWidth: 150,
      renderCell: (params) => params.row.supplier?.name || "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRowId(params.row._id); }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={menuRowId === params.row._id && Boolean(menuAnchor)}
            onClose={() => { setMenuAnchor(null); setMenuRowId(null); }}
          >
            <MenuItem onClick={() => { handleView(params.row); setMenuAnchor(null); setMenuRowId(null); }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View
            </MenuItem>
            <MenuItem onClick={() => { handleEdit(params.row._id); setMenuAnchor(null); setMenuRowId(null); }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => { handleDelete(params.row._id); setMenuAnchor(null); setMenuRowId(null); }}
              disabled={deleteInventoryLoading && deleteItemId === params.row._id}
              sx={{ color: "#B71C1C" }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {deleteInventoryLoading && deleteItemId === params.row._id ? "Deleting..." : "Delete"}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (getAllInventoryLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-full mx-auto p-4 overflow-x-hidden">

          {/* ── Header ── */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#123524]">Inventory List</h2>

            <div className="flex gap-3 flex-wrap justify-end">
              <Link to="/staff/inventory">
                <Button variant="contained" color="success" startIcon={<EditIcon />}>
                  Add Inventory
                </Button>
              </Link>

              <Link to="/staff/alertlist">
                <Button variant="outlined" color="warning">
                  Alert List
                </Button>
              </Link>

              <Link to="/staff/usagelogs">
                <Button variant="outlined" color="success">
                  Usage Logs
                </Button>
              </Link>

              <Link to="/staff/stockhistory">
                <Button variant="outlined" color="success">
                  Stock History
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Search ── */}
          <div className="mb-6">
            <TextField
              fullWidth
              label="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ── DataGrid ── */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 1000, height: 600 }}>
            <DataGrid
              rows={inventory}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              showToolbar
              columnBufferPx={1200}
              sx={{
                height: "100%",
                background: "#fff",
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
                  fontSize: "16px",
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
                "& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root": { color: "#fff" },
                "& .MuiDataGrid-virtualScroller": { background: "#fff" },
                "& .MuiDataGrid-row": { backgroundColor: "transparent" },
                "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(133,169,71,0.15)" },
                "& .MuiDataGrid-footerContainer": { background: "#fff" },
              }}
            />
            </Box>
          </Box>

        </div>
      </div>

      {/* Dialogs */}
      <ViewDialog open={viewOpen} onClose={() => setViewOpen(false)} item={viewItem} />
      <StockHistoryDialog open={stockHistoryOpen} onClose={() => setStockHistoryOpen(false)} />
      <UsageLogsDialog open={usageLogsOpen} onClose={() => setUsageLogsOpen(false)} />
    </>
  );
};

export default InventoryList;