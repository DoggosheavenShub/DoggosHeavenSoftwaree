import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, TextField, Button } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Navbar from "./navbar";
import BookingRevenuePanel from "./BookingRevenuePanel";

const columns = [
  { field: "shortId", headerName: "ID", minWidth: 110 },
  { field: "customerName", headerName: "Customer Name", minWidth: 160 },
  { field: "customerEmail", headerName: "Email", minWidth: 200 },
  { field: "serviceName", headerName: "Service", minWidth: 160 },
  { field: "petName", headerName: "Pet Name", minWidth: 130 },
  { field: "petBreed", headerName: "Breed", minWidth: 130 },
  { field: "petAge", headerName: "Age", minWidth: 90 },
  { field: "appointmentDate", headerName: "Date", minWidth: 140 },
  { field: "appointmentTime", headerName: "Time", minWidth: 110 },
  { field: "status", headerName: "Status", minWidth: 120 },
  { field: "totalAmount", headerName: "Amount (₹)", minWidth: 120 },
  { field: "notes", headerName: "Notes", minWidth: 200 },
];

const BookingRevenue = () => {
  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRevenuePanel, setShowRevenuePanel] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authtoken") || "";
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment/onlineappointments`,
        { headers: { "Content-Type": "application/json", Authorization: token } }
      );
      const data = await res.json();
      if (data.success) {
        const mapped = data.appointments.map((a) => ({
          id: a._id,
          shortId: a._id.slice(-8).toUpperCase(),
          customerName: a.customerId?.fullName || "",
          customerEmail: a.customerId?.email || "",
          serviceName: a.serviceName || "",
          petName: a.petName || "",
          petBreed: a.petBreed || "",
          petAge: a.petAge || "",
          appointmentDate: new Date(a.appointmentDate).toLocaleDateString(),
          appointmentTime: a.appointmentTime || "",
          status: a.status || "",
          totalAmount: a.totalAmount ?? "",
          notes: a.notes || "",
        }));
        setAllRows(mapped);
        setRows(mapped);
      }
    } catch (err) {
      console.error("Error fetching booking revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      setRows(
        allRows.filter(
          (r) =>
            r.customerName.toLowerCase().includes(q) ||
            r.serviceName.toLowerCase().includes(q) ||
            r.petName.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q)
        )
      );
    } else {
      setRows(allRows);
    }
  }, [searchTerm, allRows]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-full mx-auto p-4 overflow-x-hidden">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#123524]">Booking Revenue</h2>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => setShowRevenuePanel(!showRevenuePanel)}
              sx={{
                background: "linear-gradient(to right, #1B5E20, #2E7D32)",
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "8px",
                "&:hover": { background: "linear-gradient(to right, #2E7D32, #1B5E20)" },
              }}
            >
              {showRevenuePanel ? "Hide Revenue Analytics" : "Show Revenue Analytics"}
            </Button>
          </div>

          <div className="mb-6">
            <TextField
              fullWidth
              label="Search by customer, service, pet or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showRevenuePanel && <BookingRevenuePanel />}

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 1200, height: 600 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 20, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                showToolbar
                columnBufferPx={1400}
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
    </>
  );
};

export default BookingRevenue;
