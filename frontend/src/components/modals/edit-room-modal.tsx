import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useEditRoom } from "@/services/useMutation";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1) //at least 1 character required
})

export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  
  const editRoomMutation = useEditRoom()
  const isModalOpen = isOpen && type === "editRoom"; 
  const { room } = data;

 

  const form = useForm<z.infer<typeof formSchema>>(
    {
            resolver: zodResolver(formSchema),
            defaultValues: {
            name:''
        }
    }) 

    const isLoading = form.formState.isSubmitting;
    useEffect(() => {
        if (room) {
            form.reset({
                name: room.name
            });
        }
    }, [room, form]);

const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        editRoomMutation.mutate({name:values.name,roomId:room?._id})
        form.reset()
        onClose()
    }catch(e){
        console.log(e)
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Chat
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
           
            <span className="text-indigo-500 font-semibold">{room?.name}</span> will be changed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
                    >
                      Room name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button  disabled={isLoading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}