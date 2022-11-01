import { ModelBase } from "./ModelBase";
export class ModelMessage extends ModelBase {
  createTime;
  receiveTime;
  messageContent;
  chatId;
  fromName;
  avatar;
  //** 是否为传入消息 */
  isInMsg;
}
