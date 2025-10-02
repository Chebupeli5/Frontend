import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { store } from "./store";
import { useAppSelector } from "./hooks/redux";
import Auth from "./components/Auth/Auth";
import AppLayout from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Categories from "./pages/Categories";
import Assets from "./pages/Assets";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import Goals from "./pages/Goals";
import Notifications from "./pages/Notifications";
import "./App.css";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="operations" element={<Operations />} />
          <Route path="categories" element={<Categories />} />
          <Route path="assets" element={<Assets />} />
          <Route path="savings" element={<Savings />} />
          <Route path="loans" element={<Loans />} />
          <Route path="goals" element={<Goals />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={ruRU}>
        <AppContent />
      </ConfigProvider>
    </Provider>
  );
};

export default App;
