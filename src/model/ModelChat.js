import { ModelBase } from "./ModelBase";
export class ModelChat extends ModelBase {
  fromName;
  sendTime;
  isSelected = false;
  lastMsg;
  avatar;
  /**
   * 0单聊，1群聊，2公众号，3 文件传输助手
   */
  chatType;
}
