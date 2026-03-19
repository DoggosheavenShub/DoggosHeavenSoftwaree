import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMedicine } from "../../store/slices/inventorySlice";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, Box, MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MedicationIcon from "@mui/icons-material/Medication";

const defaultForm = {
  medicineName: "",
  quantityUsed: "",
  petName: "",
  bookingId: "",
  usedBy: "",
  caseType: "",
  paymentStatus: "Pending",
  notes: "",
};

const UseMedicineForm = ({ open, onClose, medicineName = "", inventoryId = "", inventoryItem = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { useMedicineLoading } = useSelector((state) => state.inventory);
  const [formData, setFormData] = useState({ ...defaultForm, medicineName });

  // Computed price fields
  const [computed, setComputed] = useState({ costPrice: "", sellPrice: "", totalAmount: "", profit: "" });

  // Recompute whenever quantity or caseType changes
  useEffect(() => {
    const qty = Number(formData.quantityUsed);
    if (!inventoryItem || !qty || !formData.caseType) {
      setComputed({ costPrice: "", sellPrice: "", totalAmount: "", profit: "" });
      return;
    }
    const costPrice   = parseFloat((inventoryItem.unitCostPrice * qty).toFixed(2));
    const unitSell    = formData.caseType === "NGO"
      ? inventoryItem.unitMinRetailPriceNGO
      : inventoryItem.unitMaxRetailPriceCustomer;
    const sellPrice   = parseFloat((unitSell * qty).toFixed(2));
    const totalAmount = sellPrice;
    const profit      = parseFloat((sellPrice - costPrice).toFixed(2));
    setComputed({ costPrice, sellPrice, totalAmount, profit });
  }, [formData.quantityUsed, formData.caseType, inventoryItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(useMedicine({ ...formData, inventoryId }));
    if (res?.payload?.success) {
      alert("Medicine usage recorded successfully!");
      setFormData({ ...defaultForm, medicineName });
      setComputed({ costPrice: "", sellPrice: "", totalAmount: "", profit: "" });
      if (onSuccess) onSuccess(res.payload.currentStock);
      onClose();
    } else {
      alert(res?.payload?.message || "Failed to record medicine usage.");
    }
  };

  const handleClose = () => {
    setFormData({ ...defaultForm, medicineName });
    setComputed({ costPrice: "", sellPrice: "", totalAmount: "", profit: "" });
    onClose();
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "&:hover fieldset": { borderColor: "#3E7B27" },
      "&.Mui-focused fieldset": { borderColor: "#3E7B27" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3E7B27" },
  };

  const readOnlyStyle = {
    ...fieldStyle,
    "& .MuiOutlinedInput-root": {
      ...fieldStyle["& .MuiOutlinedInput-root"],
      backgroundColor: "rgba(133,169,71,0.08)",
    },
  };

  const showComputed = formData.caseType && formData.quantityUsed && inventoryItem;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
    >
      <DialogTitle sx={{
        background: "linear-gradient(to right, #1B5E20, #2E7D32)",
        color: "#fff", fontWeight: "bold",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: 3, py: 2,
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <MedicationIcon /> Use Medicine
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ background: "#fff", pt: 3, pb: 1 }}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField label="Medicine Name" name="medicineName" value={formData.medicineName}
              onChange={handleChange} required fullWidth sx={fieldStyle} />
            <TextField label="Quantity Used" name="quantityUsed" value={formData.quantityUsed}
              onChange={handleChange} required fullWidth type="number" inputProps={{ min: 1 }} sx={fieldStyle} />
            <TextField label="Pet Name" name="petName" value={formData.petName}
              onChange={handleChange} required fullWidth sx={fieldStyle} />
            <TextField label="Booking ID" name="bookingId" value={formData.bookingId}
              onChange={handleChange} required fullWidth sx={fieldStyle} />
            <TextField label="Used By (Staff)" name="usedBy" value={formData.usedBy}
              onChange={handleChange} required fullWidth sx={fieldStyle} />
            <TextField
              select label="Case Type" name="caseType" value={formData.caseType}
              onChange={handleChange} required fullWidth sx={fieldStyle}
            >
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="NGO">NGO</MenuItem>
            </TextField>

            {/* Auto-computed price fields */}
            {showComputed && (
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <TextField label="Cost Price (₹)" value={`₹${computed.costPrice}`}
                    fullWidth sx={readOnlyStyle} InputProps={{ readOnly: true }} />
                  <TextField label="Sell Price (₹)" value={`₹${computed.sellPrice}`}
                    fullWidth sx={readOnlyStyle} InputProps={{ readOnly: true }} />
                </Box>
                <Box display="flex" gap={2}>
                  <TextField label="Total Amount (₹)" value={`₹${computed.totalAmount}`}
                    fullWidth sx={readOnlyStyle} InputProps={{ readOnly: true }} />
                  <TextField
                    label="Profit (₹)"
                    value={`₹${computed.profit}`}
                    fullWidth
                    sx={{
                      ...readOnlyStyle,
                      "& .MuiInputBase-input": {
                        color: computed.profit >= 0 ? "#1B5E20" : "#B71C1C",
                        fontWeight: "bold",
                      },
                    }}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
            )}

            <TextField
              select label="Payment Status" name="paymentStatus" value={formData.paymentStatus}
              onChange={handleChange} fullWidth sx={fieldStyle}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </TextField>

            <TextField label="Notes" name="notes" value={formData.notes}
              onChange={handleChange} fullWidth multiline rows={3} sx={fieldStyle} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ background: "#fff", px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined"
            sx={{ borderColor: "#1B5E20", color: "#1B5E20", borderRadius: "8px",
              textTransform: "none", fontWeight: "bold",
              "&:hover": { backgroundColor: "rgba(27,94,32,0.06)" } }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={useMedicineLoading}
            sx={{ background: "linear-gradient(to right, #1B5E20, #2E7D32)",
              borderRadius: "8px", textTransform: "none", fontWeight: "bold",
              "&:hover": { background: "linear-gradient(to right, #2E7D32, #388E3C)" } }}
          >
            {useMedicineLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UseMedicineForm;
