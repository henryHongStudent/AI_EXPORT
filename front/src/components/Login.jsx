import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("test");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simply log in without validation for now
    onLogin(username || "Guest User");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-center relative">
        <div className="z-10">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to website</h1>
          <p className="text-white/80 text-lg max-w-md">
            Upload your PDF files and we'll extract and display the data for you.
            Simple, fast, and efficient document processing.
          </p>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-10 bottom-10 w-24 h-64 bg-gradient-to-tr from-pink-400 to-orange-400 rounded-full blur-sm opacity-60 transform rotate-12"></div>
          <div className="absolute right-10 top-40 w-64 h-24 bg-gradient-to-tr from-pink-400 to-orange-400 rounded-full blur-sm opacity-60"></div>
          <div className="absolute left-1/3 top-1/3 w-24 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full rotate-45"></div>
          <div className="absolute right-1/4 bottom-1/4 w-32 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full -rotate-12"></div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-10">USER LOGIN</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 py-6 bg-indigo-50 border-indigo-100 rounded-lg"
                  placeholder="Username"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-indigo-50 border-indigo-100 rounded-lg"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m5-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <Label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember
                </Label>
              </div>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full py-6 text-base font-medium rounded-lg",
                "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              )}
            >
              LOGIN
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 