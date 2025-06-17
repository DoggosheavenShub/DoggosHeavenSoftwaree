import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "./authSlice";

const initialState = {
  prescriptionList: [],
  getPrescriptionListLoading: false,
  addPrescriptionLoading: false,
};

export const addPrescription = createAsyncThunk(
  "/prescription/addprescription",
  async (formdata, { dispatch }) => {
    const token = localStorage?.getItem("authtoken") || "";
    const response = await fetch(`${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/prescription/addprescription`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });

    if (response.status === 401) {
      dispatch(logout());
    }

    const data = await response.json();
    return data;
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(addPrescription.pending, (state) => {
        state.addPrescriptionLoading = true;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.addPrescriptionLoading = false;
      })
      .addCase(addPrescription.rejected, (state) => {
        state.addPrescriptionLoading = false;
      });
  },
});

export default prescriptionSlice.reducer;