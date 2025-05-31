import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Lock,
  Key,
} from "lucide-react";
import { useUpdateUser, useChangePassword } from "../api/lambdaApi";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const UserProfile = ({ onClose, userData, userID, token }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [profile, setProfile] = useState({
    userID: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    joinDate: "",
  });
  const [formData, setFormData] = useState({ ...profile });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userData) {
      const updatedProfile = {
        userID: userData.userID || userID || "",
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phoneNumber || "",
        address: userData.address || "",
        company: userData.companyName || "",
        joinDate: userData.joinDate || "",
      };
      setProfile(updatedProfile);
      setFormData(updatedProfile);
    } else if (userID) {
      setProfile((prev) => ({ ...prev, userID }));
      setFormData((prev) => ({ ...prev, userID }));
    }
  }, [userData, userID]);

  const changePasswordMutation = useChangePassword(token);

  const handleEditToggle = () => {
    if (isEditing) {
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        userID: profile.userID || userID,
        name: formData.name || "",
        phoneNumber: formData.phone || "",
        address: formData.address || "",
        companyName: formData.company || "",
      };

      const response = await axios.patch(
        import.meta.env.VITE_UPDATE_USER,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console

      if (response.data.success) {
        const updatedProfile = {
          userID: response.data.user.userID,
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phoneNumber,
          address: response.data.user.address,
          company: response.data.user.companyName,
          joinDate: response.data.user.joinDate,
        };

        setProfile(updatedProfile);
        setFormData(updatedProfile);

        await queryClient.invalidateQueries(["user", userID]);

        toast.success("Profile updated successfully");
        setIsEditing(false);
        localStorage.setItem("username", updatedProfile.name);
      }
    } catch (error) {
      console.error("Error updating user information:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const errorMessage = "New password and confirmation do not match";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      const response = await changePasswordMutation.mutateAsync({
        userID: profile.userID || userID,

        newPassword: passwordData.newPassword,
        isAdmin: false,
      });

      if (response.success) {
        toast.success(response.message || "Password successfully changed");
        setShowPasswordModal(false);
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">User Profile</h2>
            <button
              className="px-3 py-1 rounded hover:bg-gray-200 text-gray-700"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2">
                <User size={16} className="text-primary" /> Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  disabled={isLoading}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.name}</p>
              )}
            </div>

            {/* Email (non-editable) */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> Email
              </label>
              <div className="flex items-center mt-1 pl-6">
                <p className="text-foreground">{profile.email}</p>
                <Lock size={14} className="ml-2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> Phone
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  disabled={isLoading}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Address
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  disabled={isLoading}
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.address}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="flex items-center gap-2">
                <Building size={16} className="text-primary" /> Company
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  disabled={isLoading}
                  placeholder="Enter your company name"
                />
              ) : (
                <p className="text-foreground mt-1 pl-6">{profile.company}</p>
              )}
            </div>

            {/* Join Date (read-only) */}
            <div>
              <label className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Member Since
              </label>
              <p className="text-foreground mt-1 pl-6">{profile.joinDate}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={onClose}
              disabled={isLoading}
            >
              {isEditing ? "Cancel" : "Close"}
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowPasswordModal(true)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <Key size={16} />
                Change Password
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isEditing
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError("");
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                onClick={handlePasswordChange}
                disabled={
                  isLoading ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
