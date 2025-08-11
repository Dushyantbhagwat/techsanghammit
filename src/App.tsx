import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HazardsPage } from "./pages/HazardsPage";
import { CityUpdatesPage } from "./pages/CityUpdatesPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CityProvider } from "./contexts/CityContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MapView } from "./components/analytics/MapView";
import CameraMonitoringPage from "./pages/CameraMonitoringPage";
import Parking from './parking/Parking';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CityProvider>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MapView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cameras"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CameraMonitoringPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parking"
              element={
                  <Layout>
                    <Parking />
                  </Layout>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AlertsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/city-updates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CityUpdatesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hazards"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HazardsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </CityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
