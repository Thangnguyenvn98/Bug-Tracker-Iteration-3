/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect,useState } from "react";
import { io as ClientIO, Socket} from "socket.io-client"

type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
});

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider =({children}:{children:React.ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

    useEffect(()=>{
        const socketInstance = new (ClientIO as any)(API_BASE_URL)
        socketInstance.on("connect", () => {
            setIsConnected(true)
        })
        socketInstance.on("disconnect", () => {
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    },[])

    return (
        <SocketContext.Provider value={{socket,isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}