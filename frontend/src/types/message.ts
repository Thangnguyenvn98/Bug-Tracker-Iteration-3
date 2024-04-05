export interface Message {
    _id:string;
    message: string;
    room:string;
    username:string;
    avatar:string | null;
    createdAt: string
    imageUrl: string | undefined;
  }