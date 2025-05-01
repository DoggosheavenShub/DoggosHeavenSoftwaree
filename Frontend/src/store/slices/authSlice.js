import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  user: null,
  isAuthenticated: localStorage.getItem("authtoken")!==null,
};

export const login = createAsyncThunk("/auth/login", async (formData) => {
  
  const response = await fetch(
    
    `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );
  
  const data = await response.json();
  return data;
});

export const logout = createAsyncThunk("/auth/logout", async () => {
  if(localStorage.getItem("authtoken")!==null)
  localStorage?.removeItem("authtoken");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action?.payload?.success || false;
        state.user = action?.payload?.success ? action?.payload?.user : null;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user=null
        state.isLoading=false
      });
  },
});

export default authSlice.reducer;
