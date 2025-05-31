import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import InvoiceUploadForm from "./components/Invoice-upload-form";
import DashboardCards from "./components/DashboardCards";
import PaymentPage from "./components/PaymentPage";
import PageLayout from "./components/layout/PageLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DocumentDetail from "./components/DocumentDetail";
import Loading from "./components/Loading";
import useLoading from "./hooks/useLoading";
import UserList from "./components/UserList";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const extractDisplayName = (userData) => {
  if (!userData) return "Guest";
  if (typeof userData === "string") return userData;
  return userData.name || userData.username || userData.email || "User";
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, withLoading } = useLoading();

  useEffect(() => {
    withLoading(async () => {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedUsername = localStorage.getItem("username");
      const storedUserID = localStorage.getItem("userID");

      const isAuthValid = storedAuth === "true" && storedUsername;

      if (isAuthValid) {
        setIsAuthenticated(true);
        setUsername(storedUsername);

        if (storedUserID) {
          setUserData({
            userID: storedUserID,
            username: storedUsername,
          });
        }
      } else {
        setIsAuthenticated(false);
        setUsername("");
        setUserData(null);

        const allowedPaths = ["/", "/404"];
        if (!allowedPaths.includes(location.pathname)) {
          navigate("/");
        }
      }
    });
  }, [navigate, location.pathname, withLoading]);

  const handleLogin = async (userData) => {
    await withLoading(async () => {
      setIsAuthenticated(true);
      const displayName = extractDisplayName(userData);
      setUsername(displayName);

      if (typeof userData === "object") {
        const userID =
          userData.userID ||
          userData.user?.userID ||
          userData.id ||
          userData.user?.id;

        setUserData({
          userID: userID,
          username: displayName,
        });

        if (userID) localStorage.setItem("userID", userID);
        if (userData.token) localStorage.setItem("token", userData.token);
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", displayName);

      navigate("/dashboard");
    });
  };

  const handleLogout = async () => {
    await withLoading(async () => {
      setIsAuthenticated(false);
      setUsername("");
      setUserData(null);

      localStorage.clear();
      navigate("/");
    });
  };

  const UploadFormWithNav = () => (
    <PageLayout username={username} onLogout={handleLogout} fullWidth={true}>
      <InvoiceUploadForm />
    </PageLayout>
  );

  const Dashboard = () => (
    <PageLayout username={username} onLogout={handleLogout}>
      <DashboardCards />
    </PageLayout>
  );

  const Payment = () => (
    <PageLayout username={username} onLogout={handleLogout}>
      <PaymentPage />
    </PageLayout>
  );

  const DocumentDetailPage = () => (
    <PageLayout username={username} onLogout={handleLogout}>
      <DocumentDetail />
    </PageLayout>
  );

  const UserListPage = () => (
    <PageLayout username={username} onLogout={handleLogout}>
      <UserList />
    </PageLayout>
  );

  return (
    <>
      <Toaster position="top-right" expand={true} richColors closeButton />
      <QueryClientProvider client={queryClient}>
        {isLoading || isAuthenticated === null ? (
          <Loading />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            <Route
              element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
            >
              <Route path="/upload" element={<UploadFormWithNav />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/payment" element={<Payment />} />
              <Route
                path="/document/:fileId"
                element={<DocumentDetailPage />}
              />
              <Route path="/users" element={<UserListPage />} />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        )}
      </QueryClientProvider>
    </>
  );
}

export default App;
