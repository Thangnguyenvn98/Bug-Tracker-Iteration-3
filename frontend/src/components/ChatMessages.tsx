import { cn } from "@/lib/utils";
import { useChatQuery } from "@/services/queries";
import { Fragment, useEffect, useRef } from "react";
import { Message } from "@/types/message";
import {
  Bot,
  Loader2,
  ServerCrash,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useChatSocket } from "@/hooks/useChatSocket";
import { Room } from "@/types/room";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "./ui/button";

interface ChatMessagesProps {
  currentRoom: Room | undefined;
  username: string | "";
  roomId: string | undefined;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  roomId,
  username,
  currentRoom,
}) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery(roomId);
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { onOpen } = useModal();
  const loadMoreRef = useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage, // Use fetchNextPage here
    count: data?.pages?.[0]?.messages?.length ?? 0,
  });
  const handleImagePreview = (
    imageUrl: string | undefined,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering room click
    onOpen("previewImage", { imageUrl }); // Assuming 'deleteRoom' is a valid modal type
  };

  useChatSocket({ roomId });

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [data?.pages?.[0]?.messages.length]);

  // ...
  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // ...
  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
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
    <div ref={chatRef} className="flex-1 py-4 overflow-y-auto flex flex-col">
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 text-md my-4 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="text-white flex flex-col-reverse mt-auto flex-1 overflow-y-auto">
        {data?.pages.map((group, index) => (
          <Fragment key={index}>
            {Array.isArray(group.messages) &&
              group.messages.map((message: Message) => (
                <div
                  key={message._id}
                  className={cn(
                    "rounded-lg p-2 my-4 inline-block break-words w-full max-w-[300px]",
                    message.username === username
                      ? "ml-auto mr-2 bg-blue-500 text-right"
                      : "mr-auto ml-2 bg-chat text-left"
                  )}
                >
                  <span
                    className={message.username === username ? "mr-2" : "ml-2"}
                  >
                    {message.message || ""}
                  </span>
                  {message.imageUrl && (
                    <Button
                      className="p-1 flex bg-transparent hover:bg-transparent justify-center items-center overflow-hidden max-h-[400px] h-auto"
                      onClick={(e) => handleImagePreview(message.imageUrl, e)}
                    >
                      <img
                        src={message.imageUrl}
                        alt="Uploaded"
                        className="max-h-full max-w-full object-contain cursor-pointer"
                      />
                    </Button>
                  )}

                  <div
                    className={cn(
                      "flex text-sm items-center",
                      message.username === username
                        ? "justify-end pr-2"
                        : "justify-start pl-2"
                    )}
                  >
                    <div className="flex items-center gap-x-2 mt-2">
                      <span>{message.username || ""}</span>
                      {currentRoom?.owner.username === message.username ? (
                        <ShieldCheck className="ml-1" fill="green" />
                      ) : message.username === "CHATBOT" ? (
                        <Bot className="ml-1" />
                      ) : (
                        <UserRound className="ml-1" fill="white" />
                      )}
                      <span className="text-gray-300">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
