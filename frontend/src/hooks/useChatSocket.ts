/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";
import { Message } from "@/types/message";

type ChatSocketProps = {
    roomId: string | undefined;
};

export const useChatSocket = ({ roomId }: ChatSocketProps) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !roomId) {
            return;
        }
        
        const messageReceiver = (newMessage: Message) => {
            queryClient.setQueryData(['messages', roomId], (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    console.log(oldData)
                    return { pages: [{messages:[newMessage]}]};

                }

                const newData = [...oldData.pages];

                newData[0] = {...newData[0], messages: [newMessage,...newData[0].messages]}



                return {...oldData,pages:newData}
            });
        };
        socket.on('receive_message', messageReceiver);


        return () => {
            socket.off('receive_message', messageReceiver);
        };
    }, [socket, roomId, queryClient]);
};
