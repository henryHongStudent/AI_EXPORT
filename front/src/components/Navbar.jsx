import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, User, LayoutDashboard, CreditCard, Users, Upload } from "lucide-react";
import UserProfile from "./UserProfile";
import { useLogout, useGetUser } from "../api/lambdaApi";
import { toast } from "sonner";

const Navbar = ({ username, onLogout }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const logoutMutation = useLogout();
  

  const token = localStorage.getItem("token");
  const userID = localStorage.getItem("userID");
  
  // Use userID and token to make API call
  const { data: userData, isLoading, error } = useGetUser(token);


  const isActive = (path) => {
    return location.pathname === path;
  };

  // Logout handler function
  const handleLogout = () => {
    if (userID && token) {
      logoutMutation.mutate(
        { userID, token },
        {
          onSuccess: () => {
            toast.success("Successfully logged out");
            // Call logout function managed in App.jsx
            onLogout();
          },
          onError: (error) => {
            console.error('Logout error:', error);
            toast.error("Failed to logout properly");
            // Handle logout locally even if error occurs
            localStorage.removeItem('token');
            localStorage.removeItem('userID');
            localStorage.removeItem('username');
            onLogout();
          }
        }
      );
    } else {
      // Just handle logout if no information is available
      toast.success("Successfully logged out");
      onLogout();
    }
  };

  // Safely display username
  const displayUsername = () => {
    const name = localStorage.getItem("username");
  
    return name;
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left side - Logo and app name */}
          <div className="flex items-center gap-2">
            <Link to="/upload" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                  <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                  <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span className="text-lg font-semibold">AI-EXTRACTOR</span>
            </Link>
          </div>

          {/* Right side - Navigation and user */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 md:gap-2">
              <Link to="/dashboard">
                <button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                    isActive("/dashboard") 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
              </Link>
              
              <Link to="/upload">
                <button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                    isActive("/upload") 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden md:inline">Upload</span>
                </button>
              </Link>



              <Link to="/payment">
                <button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                    isActive("/payment") 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden md:inline">Payment</span>
                </button>
              </Link>
              

              {/* Admin UserList Link */}
              {Boolean(userData?.user?.isAdmin) && (
                <Link to="/users">
                  <button 
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                      isActive("/users") 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden md:inline">Users</span>
                  </button>
                </Link>
              )}
              
              
              
              <div className="h-6 w-px bg-border mx-2"></div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setShowProfile(true)}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {displayUsername()}
                  </span>
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile 
          onClose={() => setShowProfile(false)} 
          userData={userData?.user}
          userID={userID}
          token={token}
        />
      )}
    </>
  );
};

export default Navbar; 