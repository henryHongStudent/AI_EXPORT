
/**
 * Login API
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(import.meta.env.VITE_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      mode: "cors",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to login");
    }

    const responseData = data.body ? JSON.parse(data.body) : data;

    if (responseData.token) {
      localStorage.setItem("token", responseData.token);
      localStorage.setItem(
        "user",
        JSON.stringify(responseData.user || { email })
      );
    }

    return responseData;
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
};

/**
 *
 * @param {string} userID
 * @param {boolean} redirect
 * @returns {Promise<Object>}
 */
export const logout = async (userID, redirect = false) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_LOGOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userID }),
      mode: "cors",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userData");

    if (redirect) {
      window.location.href = "/";
    }

    return data || { message: "Logged out successfully." };
  } catch (error) {
    console.error("Logout error:", error);

    // Handle local logout even if an error occurs
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userData");

    // Redirect to login page if the redirect option is enabled
    if (redirect) {
      window.location.href = "/";
    }

    throw error;
  }
};

/**
 * Registration API
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} - Registration response data
 */
export const register = async (email, password, name, confirmPassword) => {
  try {
    // Construct fields required by the API
    const requestData = {
      email,
      password,
      // Add confirmPassword field (API requirement)
      confirmPassword: confirmPassword || password,
      // Name fields
      name,
      userName: name,
    };



    const response = await fetch(import.meta.env.VITE_REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      mode: "cors",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e2) {
        data = { message: text || "Unable to process the response." };
      }
    }



    // Additional response format handling
    if (data.statusCode === 400 && data.body) {
      try {
        const bodyData = JSON.parse(data.body);
        throw new Error(bodyData.message || "Registration failed.");
      } catch (e) {
        if (e.message !== "Registration failed.") {
          throw e;
        }
      }
    }

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    // Process response data
    return data.body ? JSON.parse(data.body) : data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Get current logged-in user information
 * @returns {Object|null} - Logged-in user information or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get authentication token
 * @returns {string|null} - Authentication token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check login status
 * @returns {boolean} - Login status
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
