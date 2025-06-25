import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ChatStore from "../store/chatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = ChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-12 rounded-full relative ">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.username}</h3>
            {/* <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p> */}
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)} className="ml-auto">
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
