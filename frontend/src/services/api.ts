import { Room } from "@/types/room";
import axios from "axios";
import { User } from "@/types/user";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const axiosInstance = axios.create({baseURL: API_BASE_URL, withCredentials:true})

export const getRooms = async () => {
    const response = await axiosInstance.get<Room[]>('/api/room');
    return response.data;
}

export const getCurrentUser = async () => {
    const response = await axiosInstance.get<User>('/api/user');
    return response.data;
}

export const createRoom = async (data: {name:string}) => {
    const response = await axiosInstance.post('/api/room',data);
    return response.data;
}



export const getRoom = async ({roomId}:{roomId:string | undefined}) => {
    const response = await axiosInstance.get<Room>(`/api/room/${roomId}`);
    return response.data;
}

export const editRoom = async (data: {name:string, roomId:string | undefined}) => {
    console.log(data.name)
    const response = await axiosInstance.put<Room>(`/api/room/${data.roomId}`,data);
    return response.data
}

export const deleteRoom = async (roomId:string | undefined) => {
    const response = await axiosInstance.delete<Room>(`/api/room/${roomId}`);
    return response.data;
}