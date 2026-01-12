import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import CredentialsPage from "./pages/CredentialsPage";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { SessionProvider, useSession } from "./session";

function RequireAuth({ children }) {
  const { sessionToken } = useSession();
  if (!sessionToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function HomeRedirect() {
  const { sessionToken } = useSession();
  return <Navigate to={sessionToken ? "/vault/credentials" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="vault/credentials"
          element={
            <RequireAuth>
              <CredentialsPage />
            </RequireAuth>
          }
        />
        <Route
          path="vault/documents"
          element={
            <RequireAuth>
              <DocumentsPage />
            </RequireAuth>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAuth>
              <AccountSettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  );
}
