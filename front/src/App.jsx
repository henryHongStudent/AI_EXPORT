import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import InvoiceUploadForm from "./components/invoice-upload-form";
import Navbar from "./components/Navbar";
import DashboardCards from "./components/DashboardCards";
import PaymentPage from "./components/PaymentPage";
import { useTheme } from "./components/ThemeProvider";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Check if user is logged in when the app loads
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    
    if (storedAuth === "true" && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      
      // If they're already logged in and visiting the login page, redirect to upload
      if (location.pathname === "/") {
        navigate("/upload");
      }
    } else if (location.pathname !== "/" && location.pathname !== "/404") {
      // If not authenticated and trying to access protected routes
      navigate("/404");
    }
  }, [navigate, location.pathname]);

  const handleLogin = (name) => {
    setIsAuthenticated(true);
    setUsername(name);
    
    // Store in localStorage for persistence
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", name);
    
    // Navigate to upload page instead of dashboard
    navigate("/upload");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    
    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    
    // Navigate to login
    navigate("/");
  };

  // Create a wrapper component that includes Navbar with InvoiceUploadForm
  const UploadFormWithNav = () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        username={username} 
        onLogout={handleLogout} 
        darkMode={theme === "dark"} 
        toggleDarkMode={toggleTheme} 
      />
      <div className="flex-grow">
        <InvoiceUploadForm />
      </div>
    </div>
  );

  // Dashboard route for the navigation
  const Dashboard = () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        username={username} 
        onLogout={handleLogout} 
        darkMode={theme === "dark"} 
        toggleDarkMode={toggleTheme} 
      />
      <div className="container mx-auto p-6">
        <DashboardCards />
      </div>
    </div>
  );

  // Payment route for the navigation
  const Payment = () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        username={username} 
        onLogout={handleLogout} 
        darkMode={theme === "dark"} 
        toggleDarkMode={toggleTheme} 
      />
      <PaymentPage />
    </div>
  );

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <Routes>
        {/* Public route - Login page */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/upload" replace /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/upload" element={<UploadFormWithNav />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<Payment />} />
        </Route>
        
        {/* 404 Page */}
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch all other routes and redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;
