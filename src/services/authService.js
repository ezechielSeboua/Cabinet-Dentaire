// authService.js
import axios from "axios";
import { API_URL } from "../utils/config";
import { AuthHeader } from "../utils/authHeader";

export const login = (email, password) => {
  return axios
    .post(
      API_URL + "/auth/signin",
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      // Check all possible response structures
      let tokenToStore = null;

      // Format 1: { body: { accessToken: "..." } }
      if (response.data?.body?.accessToken) {
        tokenToStore = response.data;
      }
      // Format 2: { accessToken: "..." }
      else if (response.data?.accessToken) {
        tokenToStore = response.data;
      }
      // Format 3: { token: "..." }
      else if (response.data?.token) {
        tokenToStore = response.data;
      }

      if (tokenToStore) {
        localStorage.setItem("user", JSON.stringify(tokenToStore));
      } else {
        throw new Error("No token in login response");
      }

      return response.data;
    });
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const logout = () => {
  localStorage.removeItem("user");
  // Optional: Redirect to login page
  window.location.href = "/login";
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!(
    user?.body?.accessToken ||
    user?.accessToken ||
    user?.token
  );
};

const auth = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
};

export default auth;
