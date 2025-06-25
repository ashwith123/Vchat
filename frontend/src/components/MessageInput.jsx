import { useState } from "react";
import { useRef } from "react";
import ChatStore from "../store/chatStore";
import { X } from "lucide-react";
import { Image } from "lucide-react";
import { Send } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = ChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return; // No file selected

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file"); // Display an error toast
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set the image preview URL
    };
    reader.readAsDataURL(file); // Read the file as a Data URL
  };
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    // Don't send if both text and image are empty
    if (!text.trim() && !imagePreview) {
      return;
    }

    try {
      await sendMessage({
        text: text.trim(), // Trim whitespace from the text
        image: imagePreview, // The Data URL of the image
      });

      setText(""); // Clear the text input
      setImagePreview(null); // Clear the image preview state
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
