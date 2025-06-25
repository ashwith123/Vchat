import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  profiles: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/check");
      set({ authUser: res.data });
    } catch (err) {
      console.error("Error while checking user:", err);
      const message =
        err.response?.data?.message || "problem whhile checking autherization";
      toast.error(message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    console.log("This is being sent to backend:", data);
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/logout");
      set({ authUser: null });
      toast.success("logged out sucess fully");
    } catch (error) {
      console.log(error);
      toast.error("error logging out");
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/login", data);
      set({ authUser: res.data });
      toast.success(" login  successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      console.log(err);
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    console.log("this sent to backend while uploading", data);
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/update-profile", data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  getprofile: async () => {
    try {
      const res = await axiosInstance.get("/msg/users");
      set({ profiles: res.data });
    } catch (err) {
      consol.log(err);
    }
  },
}));
