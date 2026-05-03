import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "../services/projectService";

// ── Async Thunks ──────────────────────────────────────────
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await projectService.getAllProjects();
      return data.projects;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const data = await projectService.createProject(projectData);
      return data.project;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
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

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectsError(state) {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // createProject
    builder
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.data.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
      });
  },
});

export const { clearProjectsError } = projectsSlice.actions;

// ── Selectors ─────────────────────────────────────────────
export const selectProjects        = (state) => state.projects.data;
export const selectProjectsLoading = (state) => state.projects.isLoading;
export const selectProjectsError   = (state) => state.projects.error;
export const selectIsCreating      = (state) => state.projects.isCreating;
export const selectCreateError     = (state) => state.projects.createError;

export default projectsSlice.reducer;
