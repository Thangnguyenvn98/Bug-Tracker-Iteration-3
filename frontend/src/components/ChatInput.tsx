import React, { useState } from "react";
import { Button } from "./ui/button";
import EmojiPicker from "./EmojiPicker";
import { Socket } from "socket.io-client";
import { Input } from "./ui/input";
import { SendHorizontal } from "lucide-react";
import { Room } from "@/types/room";
import ImageUpload from "./image-upload";

interface ChatInputProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  socket: Socket;
  isConnected: boolean;
  currentRoom: Room | undefined;
  username: string;
  roomId: string | undefined;
}

const ChatInput: React.FC<ChatInputProps> = ({
  roomId,
  username,
  currentRoom,
  socket,
  isConnected,
  message,
  setMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(""); // State to hold the uploaded image URL
  const minInputHeight = "40px"; // Set a minimum height for the input field
  const [inputHeight, setInputHeight] = useState(minInputHeight);

  const handleImageRemove = () => {
    setImageUrl("");
    setInputHeight(minInputHeight); // Reset to minimum input height when image is removed
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (isConnected && (message || imageUrl) && currentRoom) {
      setIsLoading(true);
      const messageData = {
        username,
        message,
        imageUrl,
        createdAt: new Date(Date.now()),
        room: roomId,
      };
      socket.emit("send_message", messageData);
      setIsLoading(false);
      setMessage("");
      setImageUrl("");
      setInputHeight(minInputHeight);
    }
  };
  return (
    <form className="p-2 mt-auto w-full" onSubmit={handleSubmit}>
      <div className="relative">
        <div className="flex flex-col">
          {imageUrl && (
            <div className="relative mb-2">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="max-w-[150px] h-auto object-cover rounded"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={handleImageRemove}
              >
                &times;
              </button>
            </div>
          )}
          <div className="flex items-end">
            <EmojiPicker
              onChange={(emoji: string) =>
                setMessage((prev) => `${prev} ${emoji}`)
              }
            />
            <Input
              className="bg-chat  placeholder:text-gray-200 text-white flex-grow"
              type="text"
              placeholder="Messages"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ height: inputHeight }}
              onInput={(e) => {
                const target = e.currentTarget;
                if (target.scrollHeight > target.clientHeight) {
                  setInputHeight(target.scrollHeight + "px");
                }
              }}
            />
            <ImageUpload
              className="ml-2"
              onChange={(url) => {
                setImageUrl(url);
                setInputHeight(minInputHeight);
              }}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-transparent text-white hover:bg-transparent ml-2"
            >
              <SendHorizontal />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
