import { useRoom } from "@/services/queries"
import { Loader2, ServerCrash, ShieldCheck, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatDetails = ({showParticipants, roomId} :{showParticipants:boolean,roomId:string | undefined}) => {
  
  const { data: room, status } = useRoom(roomId);
  const navigate = useNavigate();


  useEffect(() => {
    // If there's an error fetching the room (e.g., room is deleted), navigate to /messages
    if (status === 'error' && !room) {
      navigate('/messages');
    }
  }, [status, room, navigate]);
  if (!roomId) {
    return (
        <div className="text-center text-zinc-500">
            <p>Select a room to see details</p>
        </div>
    );
}
  
  if (status === 'pending') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading room details...</p>
      </div>
    );
  }

 

  if (status === 'error') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong!</p>
      </div>
    );
  }

  return (
    <>
      {showParticipants &&  (
        <aside className="border-l-[1px] border-gray-500 text-white w-64 flex flex-col flex-shrink-0 sticky top-0 h-screen">
          <div className="p-4 flex flex-col  space-y-4 ">
            <h1 className="text-lg text-center">{room.name}</h1>
            <h2 className="text-lg font-semibold mb-4">Chat members ({room?.members.length})</h2>
            {room?.members.map((member) => (
              <div key={member._id} className="mb-2">
                <div className="flex items-center gap-x-2">
                  <span>{member.username}</span>
                  {member.username === room?.owner.username ? <ShieldCheck fill="green"/> : <UserRound fill="white"/> }
                </div>
               
              </div>
            ))}
          </div>
        </aside>
      )}
    </>
  );
};

export default ChatDetails