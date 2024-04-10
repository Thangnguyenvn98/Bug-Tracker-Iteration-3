import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom, deleteRoom, editRoom } from "./api";
import toast from "react-hot-toast";

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onMutate: () => {
      console.log("mutate");
    },
    onError: () => {
      console.log("error");
      toast.error("Failed to create room.");
    },
    onSuccess: () => {
      toast.success("Room created successfully");
    },
    //the queryKey for invalidateQueries should related to a query
    //Key we have made when fetching rooms for instance so you can
    //refresh the page
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });
}

export function useEditRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editRoom,
    onMutate: () => {
      console.log("mutate");
    },
    onError: () => {
      console.log("error");
      toast.error("Failed to edit room.");
    },
    onSuccess: () => {
      toast.success("Room edited successfully");
    },
    //the queryKey for invalidateQueries should related to a query
    //Key we have made when fetching rooms for instance so you can
    //refresh the page
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onMutate: () => {
      console.log("mutate");
    },
    onError: () => {
      console.log("error");
      toast.error("Failed to delete room.");
    },
    onSuccess: () => {
      toast.success("Room deleted successfully");
    },
    //the queryKey for invalidateQueries should related to a query
    //Key we have made when fetching rooms for instance so you can
    //refresh the page
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });
}
