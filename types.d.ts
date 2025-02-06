type PluginMessage = {
  Sender: string;
  Message: Object;
  MessageID: string;
  toggle: boolean;
};

type Primitive = string | number | boolean | bigint | symbol | null;

declare type PluginProps = {
  getData:  () => PluginMessage;
  getDataHistory: () => PluginMessage[];
  getSender: () => string;
  getUser: () => string;
  isMe: () => boolean;
  sendCreateMessage: (data: object | Primitive) => void;
  sendUpdateMessage: (data: object | Primitive) => void;
  sendDeleteMessage: (data: object | Primitive) => void;
};
