import { useEffect, useState } from "react";
import { useSocket } from "./providers/socket-provider";
import { useNavigate, useParams } from "react-router-dom";

import ChatDetails from "./ChatDetails";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";

import { useCurrentUser, useRooms } from "@/services/queries";
import { Loader2, ServerCrash } from "lucide-react";
import { DeleteChannelModal } from "./modals/delete-room-modal";
import { EditChannelModal } from "./modals/edit-room-modal";
import { ImagePreviewModal } from "./modals/preview-image-modal";

const ChatPage = () => {
  const { isConnected, socket } = useSocket();
  const { roomId } = useParams();
  const [showParticipants, setShowParticipants] = useState(false);

  const [message, setMessage] = useState("");

  const useRoomsQuery = useRooms();
  const useUserQuery = useCurrentUser();
  const currentRoom = useRoomsQuery.data?.find((room) => room._id === roomId);
  const userId = useUserQuery.data?._id;
  const username = useUserQuery.data?.username;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/sign-in");
    }

    if (
      roomId &&
      socket &&
      useUserQuery.data?._id &&
      useUserQuery.data?.username
    ) {
      // Only join the room if not already joined or if the room has changed
      socket.emit("join_room", { userId, username, roomId });
      // Optionally, fetch and set room details if not already done
    }
  }, [isConnected, socket, roomId, userId, username]);

  if (useRoomsQuery.status === "pending" || useUserQuery.status === "pending") {

    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (useRoomsQuery.status === "error" || useUserQuery.status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen max-w-full bg-black relative">
      {/* Left Sidebar */}
      <ChatList
        userId={useUserQuery.data?._id}
        roomId={roomId}
        rooms={useRoomsQuery.data}
        username={useUserQuery.data?.username}
        socket={socket}
      />
      {/* Chat Container */}
      {userId && roomId && (
        <div className="flex flex-1 flex-col relative">
          <DeleteChannelModal />
          <EditChannelModal />
          <ImagePreviewModal />
          <ChatHeader
            currentRoom={currentRoom}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
          />
          {/* Chat messages */}
          <ChatMessages
            roomId={roomId}
            currentRoom={currentRoom}
            username={useUserQuery.data?.username}
          />
          {/* Input bar */}
          <ChatInput
            socket={socket}
            roomId={roomId}
            username={useUserQuery.data?.username}
            currentRoom={currentRoom}
            isConnected={isConnected}
            message={message}
            setMessage={setMessage}
          />
        </div>
      )}
      {/* Right Sidebar */}
      <ChatDetails roomId={roomId} showParticipants={showParticipants} />
    </div>
  );
};

export default ChatPage;
