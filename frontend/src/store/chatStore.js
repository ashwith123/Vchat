import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

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
      console.log("added to databse is ", res.data);
      set({ messages: [...messages, res.data] });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Unable to chat details";
      toast.error(message);
    }
  },

  subscribeToMessage: () => {
    console.log("subscribing to user");
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Socket  user  available");
    }

    let { selectedUser } = get();
    if (!selectedUser) {
      console.log("no selected user");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId != selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeToMessage: () => {
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

export default ChatStore;
