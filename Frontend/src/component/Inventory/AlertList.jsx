import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";

const AlertList = () => {
  const navigate = useNavigate();
  const [inventoryList, setInventoryList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authtoken") || "";
    const es = new EventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/inventory/lowstockalerts-sse?token=${token}`
    );
    es.onmessage = (e) => setInventoryList(JSON.parse(e.data));
    return () => es.close();
  }, []);

  const handleRefill = (id) => {
    navigate("/staff/editInventory", { state: { id } });
  };

  const rows = inventoryList?.map((item, idx) => ({
    ...item,
    id: item._id,
    no: idx + 1,
  })) || [];

  const columns = [
    {
      field: "no",
      headerName: "No.",
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
          <span className="font-bold text-[#123524]">{params.row.no}</span>
        </div>
      ),
    },
    {
      field: "itemName",
      headerName: "Name",
      flex: 1.5,
      renderCell: (params) => (
        <span className="font-semibold text-[#123524]">{params.row.itemName}</span>
      ),
    },
    {
      field: "stockUnit",
      headerName: "Stock Unit",
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="w-2 h-2 bg-[#3E7B27] rounded-full"></div>
          <span className="font-medium text-[#123524]">{params.row.stockUnit}</span>
        </div>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-orange-600">{params.row.stock}</span>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleRefill(params.row._id)}
          sx={{
            background: "linear-gradient(to right, #123524, #3E7B27)",
            fontWeight: "bold",
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(to right, #3E7B27, #85A947)",
            },
          }}
        >
          Refill
        </Button>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
            <h2 className="text-3xl tracking-widest font-bold text-[#123524]">
              ALERT LIST
            </h2>
            <div className="w-5 h-5 bg-gradient-to-r from-[#85A947] to-[#3E7B27] rounded-full"></div>
          </div>
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              showToolbar
              sx={{
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(18,53,36,0.12)",
                border: "1px solid rgba(133,169,71,0.2)",
                "& .MuiDataGrid-toolbarContainer": {
                  backgroundColor: "transparent",
                  padding: "8px 16px",
                  borderBottom: "1px solid rgba(27,94,32,0.2)",
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-root": {
                  color: "#123524",
                  fontWeight: "bold",
                  fontSize: "13px",
                },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#123524", color: "#fff" },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#123524",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold", color: "#fff" },
                "& .MuiDataGrid-columnSeparator": { color: "#fff" },
                "& .MuiDataGrid-iconButtonContainer .MuiIconButton-root": {
                  color: "#123524",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  padding: "2px",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                },
                "& .MuiDataGrid-row": {
                  background: "linear-gradient(to right, #ffffff, rgba(239,227,194,0.2))",
                  borderBottom: "2px solid rgba(133,169,71,0.2)",
                },
                "& .MuiDataGrid-row:hover": {
                  background: "linear-gradient(to right, rgba(239,227,194,0.3), rgba(133,169,71,0.1))",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#fff",
                  borderTop: "1px solid rgba(133,169,71,0.2)",
                },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
};

export default AlertList;
