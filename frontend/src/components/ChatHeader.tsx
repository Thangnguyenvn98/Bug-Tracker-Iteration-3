import { Button } from "./ui/button";
import { Crown, Info } from "lucide-react";
import { Room } from "@/types/room";

interface ChatHeaderProps {
  showParticipants: boolean;
  setShowParticipants: (prev: boolean) => void;
  currentRoom: Room | undefined;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  showParticipants,
  setShowParticipants,
  currentRoom,
}) => {
  return (
    <>
      <Button
        className="p-2 rounded-full text-blue-500 focus:outline-none focus:ring hover:bg-slate-100 absolute right-4 top-6"
        onClick={() => setShowParticipants(!showParticipants)}
      >
        {/* Icon or text to indicate toggle functionality */}
        <Info />
      </Button>
      <div className="p-4 bg-cyan-800 bg-opacity-15 rounded-md">
        <div className="flex gap-x-2 items-center ">
          {/* <div className="w-10 h-10">
            <img src={rooms[1].images} alt={rooms[1].label} className="rounded-full" />
        </div> */}
          {currentRoom ? (
            <div className="flex gap-x-2 items-center  ">
              <div>
                <p className=" text-xl text-white">{currentRoom.name}</p>
                <div className="flex items-center">
                  <h2 className="text-gray-400 text-sm">
                    {currentRoom.owner.username}
                  </h2>
                  <Crown fill="yellow" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-x-2 items-center  ">
              <div>
                <h2 className="text-white text-xl">Select a room</h2>
                <p className="text-gray-400">No room selected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
