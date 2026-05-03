import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";
import projectsReducer from "../features/projects/store/projectsSlice";
import incidentsReducer from "../features/incidents/store/incidentsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    incidents: incidentsReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
