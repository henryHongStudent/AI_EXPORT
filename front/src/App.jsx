import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import InvoiceUploadForm from "./components/invoice-upload-form";
import DashboardCards from "./components/DashboardCards";
import PaymentPage from "./components/PaymentPage";
import PageLayout from "./components/layout/PageLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HistoryPage from "./components/HistroyPage";
import DocumentDetail from "./components/DocumentDetail";
import Loading from "./components/Loading";
import useLoading from "./hooks/useLoading";
import UserList from "./components/UserList";
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

// Helper function to extract display name from user object
const extractDisplayName = (userData) => {
  if (!userData) return "Guest";
  
  if (typeof userData === 'string') return userData;
  
  return userData.name || userData.username || userData.email || "User";
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, withLoading } = useLoading();

  // Check if user is logged in when the app loads
  useEffect(() => {
    withLoading(async () => {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedUsername = localStorage.getItem("username");
      const storedUserID = localStorage.getItem("userID");
      
      if (storedAuth === "true" && storedUsername) {
        setIsAuthenticated(true);
        setUsername(storedUsername);
        
        if (storedUserID) {
          setUserData({
            userID: storedUserID,
            username: storedUsername
          });
        }
        
        if (location.pathname === "/") {
          navigate("/upload");
        }
      } else if (location.pathname !== "/" && location.pathname !== "/404") {
        navigate("/404");
      }
    });
  }, [navigate, location.pathname, withLoading]);

  const handleLogin = async (userData) => {
    await withLoading(async () => {
      setIsAuthenticated(true);

      
      const displayName = extractDisplayName(userData);
      setUsername(displayName);
      
      if (typeof userData === 'object') {
        const userID = userData.userID || userData.user?.userID || userData.id || userData.user?.id;
      
        setUserData({
          userID: userID,
          username: displayName
        });
        
        if (userID) {
          localStorage.setItem("userID", userID);
        }
        
        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }
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
      // Clear all user-related data from localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
      localStorage.removeItem("userID");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");
      localStorage.removeItem("lastLogin");
      localStorage.removeItem("refreshToken");
      
      // Clear any other potential user-related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_') || key.includes('auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });
      
      navigate("/");
    });
  };

  // Create a wrapper component that includes Navbar with InvoiceUploadForm
  const UploadFormWithNav = () => (
    <PageLayout
      username={username}
      onLogout={handleLogout}
      fullWidth={true}
    >
      <InvoiceUploadForm />
    </PageLayout>
  );

  // Dashboard route for the navigation
  const Dashboard = () => (
    <PageLayout
      username={username}
      onLogout={handleLogout}
    >
      <DashboardCards />
    </PageLayout>
  );

  // Payment route for the navigation
  const Payment = () => (
    <PageLayout
      username={username}
      onLogout={handleLogout}
    >
      <PaymentPage />
    </PageLayout>
  );


  // Document Detail route for the navigation
  const DocumentDetailPage = () => (
    <PageLayout
      username={username}
      onLogout={handleLogout}
    >
      <DocumentDetail />
    </PageLayout>
  );

  // UserList route for admin users
  const UserListPage = () => (
    <PageLayout
      username={username}
      onLogout={handleLogout}
    >
      <UserList />
    </PageLayout>
  );

  return (
    <>
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
      <QueryClientProvider client={queryClient}>
        <div>
          {isLoading && <Loading />}
          <Routes>
            {/* Public route - Login page */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/upload" element={<UploadFormWithNav />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/document/:fileId" element={<DocumentDetailPage />} />
              <Route path="/users" element={<UserListPage />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Catch all other routes and redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </QueryClientProvider>
    </>
  );
}

export default App;
