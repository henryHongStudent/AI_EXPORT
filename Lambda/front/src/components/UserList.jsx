import React, { useEffect, useState } from "react";
import {
  useGetAllUsers,
  useToggleUserStatus,
} from "../api/lambdaApi";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "./ui/table";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Lock, Unlock, Key } from "lucide-react";
import { toast } from "sonner";
import PasswordChangeModal from "./PasswordChangeModal";

const UserList = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const {
    data: usersData,
    isLoading,
    error: usersError,
  } = useGetAllUsers(token);
  const toggleStatusMutation = useToggleUserStatus();

  useEffect(() => {
    if (usersData && usersData.users) {
      // Transform DynamoDB format to plain objects
      const transformedUsers = usersData.users.map(user => ({
        userID: user.userID?.S || '',
        name: user.name?.S || '',
        email: user.email?.S || '',
        isActive: user.isActive?.BOOL || false,
        isAdmin: user.isAdmin?.BOOL || false,
        address: user.address?.S || '',
        companyName: user.companyName?.S || '',
        phoneNumber: user.phoneNumber?.S || '',
        joinDate: user.joinDate?.S || '',
        lastLogout: user.lastLogout?.S || '',
        profilePicture: user.profilePicture?.NULL ? null : user.profilePicture?.S || null
      }));
      setUsers(transformedUsers);
    }
  }, [usersData]);

  const handleToggleActive = async (userID) => {
    try {
      const response = await toggleStatusMutation.mutateAsync({ userID });

      if (response.success) {
        const updatedUsers = users.map((user) =>
          user.userID === response.user.userID
            ? { ...user, isActive: response.user.isActive }
            : user
        );

        setUsers(updatedUsers);
        toast.success(
          `User ${
            response.user.isActive ? "activated" : "deactivated"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500 p-4 rounded-lg bg-red-50">
          Error loading users: {usersError.message || "Unknown error occurred"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter((user) => user.isAdmin === false)
              .map((user) => (
                <TableRow key={user.userID}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user.userID)}
                        title={
                          user.isActive ? "Deactivate User" : "Activate User"
                        }
                      >
                        {user.isActive ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        title="Change Password"
                      >
                        <Key size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Password Change Modal */}
      {selectedUser && (
        <PasswordChangeModal
          token={token}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}
    </div>
  );
};

export default UserList;
