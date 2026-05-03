import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store";
import { router } from "./router";
import "./app.css";
import authService from "../features/auth/services/authService";
import {
  authSuccess,
  sessionResolved,
} from "../features/auth/store/authSlice";

/**
 * AppBootstrap — lives inside <Provider> so it can use Redux hooks.
 * Fires a single getMe call on mount to rehydrate the session from
 * the HttpOnly cookie before any routes render.
 */
const AppBootstrap = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rehydrateSession = async () => {
      try {
        const data = await authService.getMe();
        dispatch(authSuccess(data.user));
      } catch {
        // 401 or network error — user is a guest, mark session checked
        dispatch(sessionResolved());
      }
    };

    rehydrateSession();
  }, [dispatch]); // runs exactly once on mount

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
};

export default App;