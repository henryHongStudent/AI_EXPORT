import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChangePassword } from "@/api/lambdaApi";
import { toast } from "sonner"; 
import { Loader2 } from "lucide-react"; 
const PasswordChangeModal = ({ token, selectedUser, setSelectedUser }) => {
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const changePasswordMutation = useChangePassword(token);

  const handlePasswordChange = async (userID) => {
    if (!newPassword) return;

    setIsLoading(true);
    try {
      setError("");
      await changePasswordMutation.mutateAsync({
        userID: localStorage.getItem("userID"),
        newPassword,
        isAdmin: true,
        targetUserID: userID,
      });

      setSelectedUser(null);
      setNewPassword("");
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
      toast.error("Failed to change password"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Changing password for {selectedUser.name || selectedUser.email}
        </p>
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError("");
          }}
          className="mb-4"
        />
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedUser(null);
              setNewPassword("");
              setError("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handlePasswordChange(selectedUser.userID)}
            disabled={!newPassword || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
