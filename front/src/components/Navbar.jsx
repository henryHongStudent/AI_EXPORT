import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, User, LayoutDashboard, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import UserProfile from "./UserProfile";

const Navbar = ({ username, onLogout, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
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
              <span className="text-lg font-semibold">DocuAI</span>
            </Link>
          </div>

          {/* Right side - Navigation and user */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 md:gap-2">
              <Link to="/dashboard">
                <Button 
                  variant={isActive("/dashboard") ? "default" : "ghost"} 
                  size="sm" 
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/payment">
                <Button 
                  variant={isActive("/payment") ? "default" : "ghost"} 
                  size="sm" 
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden md:inline">Payment</span>
                </Button>
              </Link>
              
              <Button 
                onClick={toggleDarkMode} 
                variant="ghost" 
                size="icon" 
                className="ml-2"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <div className="h-6 w-px bg-border mx-2"></div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 whitespace-nowrap"
                  onClick={() => setShowProfile(true)}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{username}</span>
                </Button>
                
                <Button 
                  onClick={onLogout} 
                  variant="destructive" 
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* User Profile Modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar; 