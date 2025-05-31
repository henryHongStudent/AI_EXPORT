import React, { useState } from "react";
import { useLogin } from "../../api/lambdaApi";
import { toast } from "sonner";

/**
 * LoginForm - Reusable login form component
 * @param {function} onSubmit - Function to call on form submission
 * @param {function} onSwitchToSignup - Function to switch to signup view
 */
const LoginForm = ({ onSubmit, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const loginMutation = useLogin();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoginError("");

    
    loginMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        
        onSuccess: (data) => {
          if (data.message === "Login successful") {
            toast.success("Successfully logged in");
            // Pass user information on successful login
            onSubmit(data.user);
          } else {
            setLoginError(data.message || "Login failed. Please try again.");
            toast.error(data.message || "Login failed. Please try again.");
          }
        },
        onError: (error) => {

          let errorMessage = "Login failed. Please try again.";
          
          if (error.response) {
            const { status, data } = error.response;

            
            switch (status) {
              case 403:
                errorMessage = "This account has been deactivated. Please contact the administrator.";
                break;
              case 401:
                errorMessage = data.message || "Invalid email or password";
                break;
              case 400:
                errorMessage = data.message || "Invalid input";
                break;
              default:
                errorMessage = data.message || errorMessage;
            }
          }
          
          setLoginError(errorMessage);
          toast.error(errorMessage);
        }
      }
    );
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="max-w-md w-full p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-600 mt-2">Sign in to your account to get started</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

     

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 