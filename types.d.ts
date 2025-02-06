type PluginMessage = {
  Sender: string;
  Message: Object;
  MessageID: string;
  toggle: boolean;
};

type Primitive = string | number | boolean | bigint | symbol | null;

declare type PluginProps = {
  getData:  () => any;
  getDataHistory: () => any[];
  getSender: () => string;
  getUser: () => string;
  isMe: () => boolean;
  sendCreateMessage: (data: object | Primitive, persist: boolean) => void;
  sendUpdateMessage: (data: object | Primitive) => void;
  sendDeleteMessage: (data: object | Primitive) => void;
};

