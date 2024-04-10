import { Pencil, Search, Trash2 } from "lucide-react";
import { CreateRoom } from "./ui/createRoom";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { Room } from "@/types/room";
import { useState } from "react";
import { useModal } from "@/hooks/use-modal-store";

interface ChatListProps {
  userId: string | "";
  roomId: string | undefined;
  username: string;
  rooms: Room[];
  socket: Socket;
}
const ChatList: React.FC<ChatListProps> = ({
  roomId,
  userId,
  username,
  rooms,
  socket,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { onOpen } = useModal();
  const handleRoomClick = (room: Room) => {
    console.log(room);
    if (room._id && username) {
      if (roomId && roomId !== room._id) {
        socket.emit("leave_room", { room: roomId, userId });
      }
      socket.emit("join_room", { userId, username, roomId: room._id });
      navigate(`/messages/c/${room.owner._id}/t/${room._id}`);
    }
  };

  const handleEditClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering room click
    onOpen("editRoom", { room }); // Assuming 'editRoom' is a valid modal type
  };

  const handleDeleteClick = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering room click
    onOpen("deleteRoom", { room }); // Assuming 'deleteRoom' is a valid modal type
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <aside className="w-96 bg-white flex flex-shrink-0 overflow-y-auto sticky top-0 h-[100dvh]">
      <div className="flex flex-col space-y-4 flex-grow p-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Chats</h1>
          <CreateRoom />
        </div>
        <div className="relative">
          <Search className="absolute left-0 ml-2 top-[0.35rem]" />
          <Input
            className="bg-slate-200 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search Community Chat"
          />
        </div>
        <h2 className="font-semibold">Your Communities Chats</h2>
        {filteredRooms.map((room, index) => (
          <div
            key={index}
            onClick={() => handleRoomClick(room)}
            className={cn(
              "flex flex-col p-2 rounded-md cursor-pointer hover:bg-slate-100",
              room._id === roomId
                ? "bg-chat-color text-white hover:bg-chat-color"
                : ""
            )}
          >
            <div className="flex flex-col ">
              <div className="flex items-center justify-between">
                <div>
                  <h2>{room.owner.username}</h2>
                  <p>{room.name}</p>
                </div>
                <div>
                  {userId === room.owner._id && (
                    <div className="flex gap-x-2">
                      <button onClick={(e) => handleEditClick(room, e)}>
                        <Pencil className="w-5 h-5 cursor-pointer" />
                      </button>

                      <button onClick={(e) => handleDeleteClick(room, e)}>
                        <Trash2 className="w-5 h-5 cursor-pointer text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatList;
