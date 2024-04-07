import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { axiosInstance, getCurrentUser, getRoom, getRooms } from "./api";
import { useSocket } from "@/components/providers/socket-provider";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
}

export const useChatQuery = (roomId: string | undefined) => {
  const { isConnected } = useSocket();
  const fetchMessages = async ({
    pageParam,
  }: {
    pageParam: number | undefined;
  }) => {
    if (!roomId) {
      return { messages: [], nextCursor: undefined, hasNextPage: false };
    }
    const endpoint = `/api/messages/${roomId}?cursor=${pageParam || 0}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["messages", roomId],
      queryFn: fetchMessages,
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        // Determine the logic for getting the next page based on the last page's data
        lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};

export const useRoom = (roomId: string | undefined) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom({ roomId }),
    enabled: !!roomId,
  });
};
