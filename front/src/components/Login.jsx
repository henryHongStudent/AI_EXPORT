import React, { useState, useEffect } from "react";
import LoginForm from "./auth/LoginForm";
import SignupForm from "./auth/SignupForm";
import { animationStyles } from "../styles";
import { isAuthenticated, getCurrentUser, logout } from "../api/authService";

const Login = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Check if already logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        if (user) {
          onLogin({
            username: user.name || user.email,
            userID: user.userID || user.id,
            ...user
          });
        }
      }
    };

    checkLoginStatus();
  }, [onLogin]);

  const handleLoginSubmit = (userData) => {
    onLogin(userData);
  };

  const handleSignupSubmit = (userData) => {
    // Display signup success message
    setMessage(userData.message || "Sign up completed. Please log in.");
    setMessageType("success");
  };

  const handleLogout = async () => {
    try {
      const user = getCurrentUser();
      if (user && (user.userID || user.id)) {
        await logout(user.userID || user.id);
        setMessage("Logged out successfully.");
        setMessageType("success");
        // Reset UI state after logout
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage(error.message || "An error occurred during logout.");
      setMessageType("error");
    }
  };

  const switchAuthMode = (mode) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setMessage("");
    setTimeout(() => {
      setAuthMode(mode);
      setIsAnimating(false);
    }, 300);
  };

  const switchToSignup = () => switchAuthMode("signup");
  const switchToLogin = () => switchAuthMode("login");

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to AI-EXTRACTOR</h1>
          <p className="text-white/90 text-lg max-w-md">
            Upload your PDF files and we'll extract and display the data for you.
            Simple, fast, and efficient document processing.
          </p>
          
          {isAuthenticated() && (
            <button
              onClick={handleLogout}
              className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Logout
            </button>
          )}
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient circles */}
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-bl from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl"></div>
          
          {/* Small accent elements */}
          <div className="absolute left-1/4 top-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute right-1/4 bottom-1/4 w-32 h-32 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          
          {/* Animated floating elements */}
          <div className="absolute left-1/3 top-1/3 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute right-1/4 bottom-1/4 w-6 h-6 bg-white/20 rounded-full animate-float-delayed"></div>
          <div className="absolute left-1/4 bottom-1/3 w-3 h-3 bg-white/20 rounded-full animate-float-slow"></div>
        </div>
      </div>

      {/* Right side with auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Notification message */}
        {message && (
          <div className={`absolute top-4 right-4 p-4 rounded-md shadow-lg ${
            messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <div className={`${isAnimating ? 'opacity-0' : 'opacity-100'} ${animationStyles.fadeIn} bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8`}>
          {!isAuthenticated() ? (
            authMode === "login" ? (
              <LoginForm 
                onSubmit={handleLoginSubmit} 
                onSwitchToSignup={switchToSignup} 
              />
            ) : (
              <SignupForm 
                onSubmit={handleSignupSubmit} 
                onSwitchToLogin={switchToLogin} 
              />
            )
          ) : (
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Already logged in</h2>
              <p className="mb-6 text-gray-600">
                Welcome, {getCurrentUser()?.name || getCurrentUser()?.email || "User"}!
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 