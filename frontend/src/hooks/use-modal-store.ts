import { create } from "zustand";
import { Room } from "@/types/room";
export type ModalType = "deleteRoom" | "editRoom" | "previewImage"; // Added "deleteRoom" as an example

interface ModalData {
  room?: Room;
  imageUrl?: string;
  // You can add other properties here as needed
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {}, // This is fine if ModalData properties are optional
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: {} }), // Reset data on close
}));
