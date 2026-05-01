import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/store/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
