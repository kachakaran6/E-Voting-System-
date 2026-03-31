import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { ElectionsPage } from "./pages/admin/ElectionsPage";
import { CandidatesPage } from "./pages/admin/CandidatesPage";
import { ResultsPage } from "./pages/admin/ResultsPage";
import { SuperAdminsPage } from "./pages/super/SuperAdminsPage";
import { BallotPage } from "./pages/voter/BallotPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";
import { SettingsPage } from "./pages/shared/SettingsPage";
import { HistoryPage } from "./pages/voter/HistoryPage";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="elections" element={<ElectionsPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route
          path="admins"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <SuperAdminsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ballot"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <BallotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

