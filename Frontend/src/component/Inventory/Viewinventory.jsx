import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getInventoryItemDetails } from "../../store/slices/inventorySlice";
import Navbar from "../navbar";
import UseMedicineForm from "./UseMedicineForm";

import {
  Button,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import BarChartIcon from "@mui/icons-material/BarChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MedicationIcon from "@mui/icons-material/Medication";

// ── Detail Card component ──────────────────────────────────────────────────────
const DetailCard = ({ icon, label, value, subValue, accent }) => (
  <div
    className="bg-white rounded-2xl shadow-sm p-5 border flex items-start gap-4"
    style={{ borderColor: `${accent}30` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${accent}15` }}
    >
      {React.cloneElement(icon, { sx: { color: accent, fontSize: 26 } })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-[#123524] truncate">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ViewInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMedicineOpen, setUseMedicineOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(getInventoryItemDetails(id)).then((res) => {
      if (res?.payload?.success) {
        setItem(res.payload.item);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <p className="text-xl font-bold text-gray-500">Item not found.</p>
        <Button variant="contained" color="success" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // 4-level stock status synced with backend stock value
  const getStockStatus = (stock) => {
    if (stock === 0)          return { label: "Out of Stock", color: "#C62828", bg: "rgba(198,40,40,0.1)" };
    if (stock <= 10)          return { label: "Low Stock",    color: "#E65100", bg: "rgba(230,81,0,0.1)" };
    if (stock <= 50)          return { label: "In Stock",     color: "#1B5E20", bg: "rgba(27,94,32,0.1)" };
    return                           { label: "Overstock",    color: "#1565C0", bg: "rgba(21,101,192,0.1)" };
  };

  const stockStatus  = getStockStatus(item.stock);
  const maxStock     = item.totalCapacity || Math.max(item.stock, 100);
  const stockPercent = Math.min(Math.round((item.stock / maxStock) * 100), 100);

  const isExpiringSoon = (() => {
    if (!item.expiryDate) return false;
    const diffDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
  })();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-5xl mx-auto p-6">

          {/* ── Top Bar ── */}
          <div className="flex justify-between items-center mb-6">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              variant="outlined"
              sx={{
                borderColor: "#1B5E20",
                color: "#1B5E20",
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "10px",
                "&:hover": { backgroundColor: "rgba(27,94,32,0.06)" },
              }}
            >
              Back
            </Button>

            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => navigate("/staff/editInventory", { state: { id: item._id } })}
              sx={{
                background: "linear-gradient(to right, #1B5E20, #2E7D32)",
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "10px",
                "&:hover": { background: "linear-gradient(to right, #2E7D32, #388E3C)" },
              }}
            >
              Edit Item
            </Button>

            <Button
              startIcon={<MedicationIcon />}
              variant="contained"
              onClick={() => setUseMedicineOpen(true)}
              sx={{
                background: "linear-gradient(to right, #1565C0, #1976D2)",
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "10px",
                "&:hover": { background: "linear-gradient(to right, #1976D2, #1E88E5)" },
              }}
            >
              Use Medicine
            </Button>
          </div>

          {/* ── Hero Header ── */}
          <div className="bg-white rounded-3xl shadow-lg border border-[#85A947]/20 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center shadow-md flex-shrink-0">
                <InventoryIcon sx={{ color: "#fff", fontSize: 38 }} />
              </div>

              {/* Title & badges */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-[#123524]">{item.itemName}</h1>
                  <Chip
                    label={stockStatus.label}
                    size="small"
                    sx={{ backgroundColor: stockStatus.bg, color: stockStatus.color, fontWeight: "bold" }}
                  />
                  {isExpiringSoon && (
                    <Chip
                      icon={<WarningAmberIcon sx={{ color: "#E65100 !important", fontSize: 16 }} />}
                      label="Expiring Soon"
                      size="small"
                      sx={{ backgroundColor: "rgba(230,81,0,0.1)", color: "#E65100", fontWeight: "bold" }}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  <Chip
                    label={`ID: ${item.itemId || "—"}`}
                    size="small"
                    sx={{ backgroundColor: "#1B5E20", color: "#fff", fontWeight: "bold", fontSize: "12px" }}
                  />
                  <Chip
                    icon={<CategoryIcon sx={{ fontSize: 14, color: "#555 !important" }} />}
                    label={item.itemType}
                    size="small"
                    sx={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px" }}
                  />
                  <Chip
                    label={`Supplier: ${item.supplier}`}
                    size="small"
                    sx={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px" }}
                  />
                  <Chip
                    label={`Added: ${new Date(item.createdAt).toLocaleDateString()}`}
                    size="small"
                    sx={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px" }}
                  />
                </div>

                {item.description && (
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Stock Progress ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#85A947]/20 p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-[#123524] text-base">Stock Level</p>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ color: stockStatus.color, backgroundColor: stockStatus.bg }}>
                {stockStatus.label} — {item.stock} {item.stockUnit}
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={stockPercent}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: "rgba(0,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 6,
                  backgroundColor: stockStatus.color,
                },
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">0</span>
              <span className="text-xs font-semibold" style={{ color: stockStatus.color }}>
                {stockPercent}% of capacity
              </span>
              <span className="text-xs text-gray-400">{maxStock}</span>
            </div>
          </div>

          {/* ── Detail Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <DetailCard
              icon={<InventoryIcon />}
              label="Current Stock"
              value={`${item.stock} ${item.stockUnit}`}
              subValue={stockStatus.label}
              accent={stockStatus.color}
            />
            <DetailCard
              icon={<BarChartIcon />}
              label="Total Used"
              value={`${item.totalUsed} ${item.stockUnit}`}
              subValue="Since item was added"
              accent="#1565C0"
            />
            <DetailCard
              icon={<EventIcon />}
              label="Expiry Date"
              value={
                item.expiryDate
                  ? new Date(item.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "Not Set"
              }
              subValue={isExpiringSoon ? "⚠️ Expiring within 90 days" : item.expiryDate ? "Valid" : "No expiry date provided"}
              accent={isExpiringSoon ? "#E65100" : "#1B5E20"}
            />
            <DetailCard
              icon={<AttachMoneyIcon />}
              label="Cost Price"
              value={`₹${item.unitCostPrice}`}
              subValue="Per unit (purchase)"
              accent="#555"
            />
            <DetailCard
              icon={<LocalOfferIcon />}
              label="NGO Price"
              value={`₹${item.unitMinRetailPriceNGO}`}
              subValue="Min retail — NGO"
              accent="#1B5E20"
            />
            <DetailCard
              icon={<LocalOfferIcon />}
              label="Customer Price"
              value={`₹${item.unitMaxRetailPriceCustomer}`}
              subValue="Max retail — Customer"
              accent="#E65100"
            />
          </div>

          {/* ── Additional Info ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#85A947]/20 p-5">
            <p className="font-bold text-[#123524] text-base mb-4">Additional Information</p>
            <Divider sx={{ mb: 2 }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Item ID",       value: item.itemId || "—" },
                { label: "Supplier",      value: item.supplier },
                { label: "Date Added",    value: new Date(item.createdAt).toLocaleString() },
                { label: "Last Updated",  value: new Date(item.lastUpdated).toLocaleString() },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-1">
                  <span className="text-gray-400 font-medium">{row.label}</span>
                  <span className="text-[#123524] font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <UseMedicineForm
        open={useMedicineOpen}
        onClose={() => setUseMedicineOpen(false)}
        medicineName={item.itemName}
        inventoryId={item._id}
        onSuccess={(newStock) => setItem((prev) => ({ ...prev, stock: newStock }))}
      />
    </>
  );
};

export default ViewInventory;