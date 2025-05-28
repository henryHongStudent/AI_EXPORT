import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";



export function useLogin() {

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch(import.meta.env.VITE_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw {
          response: {
            status: res.status,
            data: data,
          },
        };
      }

      // Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("userID", data.user.userID);
        localStorage.setItem("username", data.user.name || data.user.email);
      }

      return data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(import.meta.env.VITE_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed to register");
      return res.json();
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async ({ userID }) => {
      const token = localStorage.getItem("token");
   

      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(import.meta.env.VITE_LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userID }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Logout error:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
        });
        throw new Error(errorData.message || "Failed to log out");
      }

    
      localStorage.removeItem("token");
      localStorage.removeItem("userID");
      localStorage.removeItem("username");

      return res.json();
    },
  });
}


export function useGetUser(token) {
  const userID = localStorage.getItem("userID");

  return useQuery({
    queryKey: ["getUser", userID],
    queryFn: async () => {
      let url = import.meta.env.VITE_GET_USER;
   
      if (userID) {
        url += `?userID=${userID}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to get user information");
      const data = await res.json();

      // Lambda response is wrapped in body property
      let parsedData;
      if (data.body) {
        try {
          parsedData = JSON.parse(data.body);
        } catch (e) {
          parsedData = data.body;
        }
      } else {
        parsedData = data;
      }

      // Ensure isAdmin is a boolean
      if (parsedData.user) {
        parsedData.user.isAdmin = Boolean(parsedData.user.isAdmin);
      }

      return parsedData;
    },
    enabled: !!token && !!userID,
  });
}

export function useUpdateUser(token) {
  return useMutation({
    mutationFn: async (updateData) => {
      const response = await axios.put(
        import.meta.env.VITE_UPDATE_USER,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
}

// Get all users (Query)
export const useGetAllUsers = (token) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_VITE_GET_ALL_USERS,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
       
        return { users: [] };
      }
    },
    enabled: !!token,
  });
};

export const useChangePassword = (token) => {

  return useMutation({
    mutationFn: async ({ userID, newPassword, isAdmin, targetUserID }) => {
      const response = await axios.put(
        import.meta.env.VITE_CHANGE_PASSWORD,
        {
          userID,
          newPassword,
          isAdmin,
          targetUserID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
};

// Toggle user active status
export function useToggleUserStatus() {
  const token = localStorage.getItem("token");

  return useMutation({
    mutationFn: async ({ userID }) => {
      const response = await axios.patch(
      import.meta.env.TOGGLE_USER_STATUS,
        { userID },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
}
