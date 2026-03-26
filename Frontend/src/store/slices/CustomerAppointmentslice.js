import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getUserPets = createAsyncThunk(
  'pets/getUserPets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/pets/my-pets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user pets'
      );
    }
  }
);


export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/customerappointment/createappoint`, appointmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const fetchCustomerAppointments = createAsyncThunk(
  'appointments/fetchCustomerAppointments',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/customerappointment/getcustomerappoint/${customerId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const getBookingRevenue = createAsyncThunk(
  'appointments/getBookingRevenue',
  async ({ year, month, day, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authtoken') || '';
      const params = new URLSearchParams();
      if (year)  params.append('year',  year);
      if (month) params.append('month', month);
      if (day)   params.append('day',   day);
      params.append('page',  page);
      params.append('limit', limit);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/appointment/bookingrevenuedata?${params.toString()}`,
        { headers: { 'Content-Type': 'application/json', Authorization: token } }
      );
      const data = await response.json();
      if (!data.success) return rejectWithValue(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch booking revenue');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/customerappointment/cancelappoint/${appointmentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomerAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchCustomerAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });
  },
});

export const { clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
