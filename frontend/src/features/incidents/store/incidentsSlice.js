import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import incidentService from "../services/incidentService";

// ── Async Thunks ──────────────────────────────────────────
export const fetchAllIncidents = createAsyncThunk(
  "incidents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await incidentService.getAllIncidents();
      return data.incidents;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch incidents");
    }
  }
);

export const createIncident = createAsyncThunk(
  "incidents/create",
  async (incidentData, { rejectWithValue }) => {
    try {
      const data = await incidentService.createIncident(incidentData);
      return data.incident;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create incident");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────
const initialState = {
  data: [],
  isLoading: false,
  isCreating: false,
  error: null,
  createError: null,
};

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    clearIncidentsError(state) {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAllIncidents
    builder
      .addCase(fetchAllIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // createIncident
    builder
      .addCase(createIncident.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.isCreating = false;
        if (action.payload) state.data.unshift(action.payload);
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
      });
  },
});

export const { clearIncidentsError } = incidentsSlice.actions;

// ── Selectors ─────────────────────────────────────────────
export const selectIncidents        = (state) => state.incidents.data;
export const selectIncidentsLoading = (state) => state.incidents.isLoading;
export const selectIncidentsError   = (state) => state.incidents.error;
export const selectIsCreatingIncident = (state) => state.incidents.isCreating;
export const selectCreateIncidentError = (state) => state.incidents.createError;

export default incidentsSlice.reducer;
