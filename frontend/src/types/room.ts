export type Member = {
  _id: string;
  username: string;
};

export type Room = {
  _id: string;
  name: string;
  owner: Member;
  members: Member[];
  blockedList: string[] | null;
  messages: string[] | null;
  ownerName: string;
};
