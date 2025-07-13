import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import io from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  profiles: null,
  Onlineusers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (err) {
      console.error("Error while checking user:", err);
      const status = err.response?.status;

      // Only toast if it’s truly an error, not just a not-logged-in user
      if (status !== 401 && status !== 403) {
        const message = err.response?.data?.message || "Authorization error";
        toast.error(message);
      } else {
        console.warn("User not logged in or token invalid");
      }
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
      get().connectSocket();
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
      get().connectDisconnect();
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
      get().connectSocket();
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

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      reutrn;
    }
    const socket = io("http://localhost:8080", {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (users) => {
      set({ Onlineusers: users });
    });
  },
  connectDisconnect: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
