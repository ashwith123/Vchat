import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const ChatStore = create((set, get) => ({
  isUsersLoading: false,
  isMessagesLoading: false,
  messages: [],
  users: [],
  selectedUser: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      let res = await axiosInstance.get("/msg/users");
      set({ users: res.data });
    } catch (err) {
      console.error("getMessages error:", err);

      const message = err.response?.data?.message || "Unable to get details";
      toast.error(message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      let res = await axiosInstance.get(`/msg/${userId}`);
      set({ messages: res.data });
    } catch (err) {
      console.error("getMessages error:", err);

      const message = err.response?.data?.message || "Unable to chat details";
      toast.error(message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/msg/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Unable to chat details";
      toast.error(message);
    }
  },

  setSelectedUser: async (selectedUser) => set({ selectedUser }),
}));

export default ChatStore;
