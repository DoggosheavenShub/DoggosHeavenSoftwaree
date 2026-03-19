import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "./authSlice";

const initialState = {
  getAllInventoryLoading: false,
  loading: false,
  inventoryList: [],
  editInventoryLoading: false,
  addInventoryLoading: false,
  deleteInventoryLoading: false,
  useMedicineLoading: false,
};

export const getAllInventory = createAsyncThunk(
  "/inventory/getallinventory",
  async (_,{dispatch}) => {
    const token=localStorage.getItem("authtoken")||""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/getallinventory`,
      {
        method: "GET",
        headers:{
          "Authorization":token,
          "Content-Type":"application/json"
        }
      }
    );

    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const editInventoryItem = createAsyncThunk(
  "/inventory/editinventoryitem",
  async (formData,{dispatch}) => {
    const token=localStorage.getItem("authtoken")||""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/editinventory`,
      {
        method: "POST",
        headers:{
          "Authorization":token,
          "Content-Type":"application/json"
        },
        body: JSON.stringify(formData),
      }
    );
    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const addInventoryItem = createAsyncThunk(
  "/inventory/addinventoryitem",
  async (formData,{dispatch}) => {
    const token=localStorage.getItem("authtoken")||""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/addinventory`,
      {
        method: "POST",
        headers:{
          "Authorization":token,
          "Content-Type":"application/json"
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "/inventory/deleteinventoryitem",
  async (id, {dispatch}) => {
    const token = localStorage.getItem("authtoken") || ""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/deleteinventory/${id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const getInventoryItemDetails = createAsyncThunk(
  "/inventory/getinventoryitemdetails",
  async (id,{dispatch}) => {
    const token=localStorage.getItem("authtoken")||""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/getinventoryitemdetails/${id}`,
      {
        method: "Get",
        headers:{
          "Authorization":token,
          "Content-Type":"application/json"
        }
      }
    );
    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const getAlertListOfInventory = createAsyncThunk(
  "/inventory/getalertlist",
  async (_,{dispatch}) => {
    const token=localStorage.getItem("authtoken")||""
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/inventory/getalertlist`,
      {
        method: "get",
        headers:{
          "Authorization":token,
          "Content-Type":"application/json"
        }
      }
    );

    if (response.status === 401) {
      dispatch(logout());
    }
    const data = await response.json();
    return data;
  }
);

export const useMedicine = createAsyncThunk(
  "/medicine/use",
  async (formData, { dispatch }) => {
    const token = localStorage.getItem("authtoken") || "";
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine/use`,
      {
        method: "POST",
        headers: { "Authorization": token, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );
    if (response.status === 401) dispatch(logout());
    return await response.json();
  }
);

export const getUsageLogs = createAsyncThunk(
  "/medicine/usagelogs",
  async (_, { dispatch }) => {
    const token = localStorage.getItem("authtoken") || "";
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine/usagelogs`,
      { method: "GET", headers: { "Authorization": token, "Content-Type": "application/json" } }
    );
    if (response.status === 401) dispatch(logout());
    return await response.json();
  }
);

export const getStockHistory = createAsyncThunk(
  "/medicine/stockhistory",
  async (_, { dispatch }) => {
    const token = localStorage.getItem("authtoken") || "";
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine/stockhistory`,
      { method: "GET", headers: { "Authorization": token, "Content-Type": "application/json" } }
    );
    if (response.status === 401) dispatch(logout());
    return await response.json();
  }
);

export const getRevenue = createAsyncThunk(
  "/medicine/revenue",
  async ({ year, month, day, page = 1, limit = 10 } = {}, { dispatch }) => {
    const token = localStorage.getItem("authtoken") || "";
    const params = new URLSearchParams();
    if (year)  params.append("year",  year);
    if (month) params.append("month", month);
    if (day)   params.append("day",   day);
    params.append("page",  page);
    params.append("limit", limit);
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine/revenue?${params.toString()}`,
      { method: "GET", headers: { "Authorization": token, "Content-Type": "application/json" } }
    );
    if (response.status === 401) dispatch(logout());
    return await response.json();
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getAllInventory.pending, (state) => {
        state.getAllInventoryLoading = true;
      })
      .addCase(getAllInventory.fulfilled, (state, action) => {
        state.getAllInventoryLoading = false;
        state.inventoryList = action?.payload?.success
          ? action?.payload?.items
          : [];
      })
      .addCase(getAllInventory.rejected, (state) => {
        state.getAllInventoryLoading = false;
      })
      .addCase(getAlertListOfInventory.fulfilled,(state,action)=>{
        state.inventoryList=action?.payload?.success?action?.payload?.items:[];
      })
      .addCase(deleteInventoryItem.pending, (state) => {
        state.deleteInventoryLoading = true;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.deleteInventoryLoading = false;
      })
      .addCase(deleteInventoryItem.rejected, (state) => {
        state.deleteInventoryLoading = false;
      }).addCase(getInventoryItemDetails.pending,(state)=>{
        state.loading=true
      }).addCase(getInventoryItemDetails.fulfilled,(state)=>{
        state.loading=false
      }).addCase(getInventoryItemDetails.rejected,(state)=>{
        state.loading=false
      }).addCase(addInventoryItem.pending,(state)=>{
        state.addInventoryLoading=true
      }).addCase(addInventoryItem.fulfilled,(state)=>{
        state.addInventoryLoading=false
      }).addCase(addInventoryItem.rejected,(state)=>{
        state.addInventoryLoading=false
      }).addCase(editInventoryItem.pending,(state)=>{
        state.addInventoryLoading=true
      }).addCase(editInventoryItem.fulfilled,(state)=>{
        state.addInventoryLoading=false
      }).addCase(editInventoryItem.rejected,(state)=>{
        state.addInventoryLoading=false
      })
      .addCase(useMedicine.pending,   (state) => { state.useMedicineLoading = true; })
      .addCase(useMedicine.fulfilled, (state) => { state.useMedicineLoading = false; })
      .addCase(useMedicine.rejected,  (state) => { state.useMedicineLoading = false; });
  },
});

export default inventorySlice.reducer;