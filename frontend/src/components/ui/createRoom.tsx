import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SquarePen } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRoom } from "@/services/useMutation";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1), //at least 1 character required
});

export const CreateRoom = () => {
  const createRoomMutation = useCreateRoom();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createRoomMutation.mutate(values);
    //update the page now when mutate
    setDialogOpen(false); // Close the dialog on success
    form.reset();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create your room</DialogTitle>
          <DialogDescription>
            Create discussion room for your audience. Click create room when
            you're done.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Event name" {...field} />
                      </FormControl>
                      <FormMessage />{" "}
                      {/* This condition defined in form constant of zod above in formSchema*/}
                    </FormItem>
                  )}
                />
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button disabled={createRoomMutation.isPending} type="submit">
                    {createRoomMutation.isPending ? "Creating ..." : "Create"}
                  </Button>
                  {/* call the obSubmit defined above*/}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
