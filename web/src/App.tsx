import { Navigate, Route, Routes } from "react-router-dom";
import { PlatformFilterProvider } from "./context/PlatformContext.js";
import { useAuth, type AppRole } from "./context/AuthContext.js";
import { AppShell } from "./components/layout/AppShell.js";
import { Dashboard } from "./pages/Dashboard.js";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import { EntriesPage } from "./pages/EntriesPage.js";
import { NewEntryWizard } from "./pages/NewEntryWizard.js";
import { Login } from "./pages/Login.js";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({
  roles,
  children,
}: {
  roles: AppRole[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <PlatformFilterProvider>
              <AppShell />
            </PlatformFilterProvider>
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route
          path="/entries/new"
          element={
            <RequireRole roles={["data-entry"]}>
              <NewEntryWizard />
            </RequireRole>
          }
        />
        {/* Legacy data-entry route → redirect */}
        <Route path="/data-entry" element={<Navigate to="/entries" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
