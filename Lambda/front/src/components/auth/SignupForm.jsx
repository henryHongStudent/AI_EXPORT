import React, { useState } from "react";
import { useRegister } from "../../api/lambdaApi";
import { toast } from "sonner";

/**
 * SignupForm - Reusable signup form component
 * @param {function} onSubmit - Function to call on form submission
 * @param {function} onSwitchToLogin - Function to switch to login view
 */
const SignupForm = ({ onSubmit, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState("");
  const registerMutation = useRegister();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field when input changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setRegisterError("");
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = "Please enter your name";
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with 1 uppercase and 1 special character";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setRegisterError("");
    registerMutation.mutate(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      },
      {
        onSuccess: (data) => {
        
          try {
            
            const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            
            if (data.statusCode === 200) {
              const successMessage = parsedBody.message || "Registration completed successfully.";
              toast.success(successMessage);
              onSubmit({
                username: formData.name,
                email: formData.email,
                message: successMessage
              });
              onSwitchToLogin();
            } else {
              
              const errorMessage = parsedBody.message || "Registration failed";
              setRegisterError(errorMessage);
              toast.error(errorMessage);
              setFormData(prev => ({
                ...prev,
                password: "",
                confirmPassword: ""
              }));
            }
          } catch (error) {
            console.error("Error parsing response:", error);
            setRegisterError("An error occurred during registration");
            toast.error("An error occurred during registration");
          }
        },
        onError: (error) => {
          console.error("Registration error:", error);
          let errorMessage = "Registration failed. Please try again.";
          
          try {
            if (error.response?.data?.body) {
              const parsedBody = JSON.parse(error.response.data.body);
              errorMessage = parsedBody.message;
            } else if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
          }
          
          setRegisterError(errorMessage);
          toast.error(errorMessage);
          setFormData(prev => ({
            ...prev,
            password: "",
            confirmPassword: ""
          }));
        }
      }
    );
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="max-w-md w-full p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Sign Up</h1>
        <p className="text-gray-600 mt-2">Create an account to get started</p>
      </div>

   

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm; 