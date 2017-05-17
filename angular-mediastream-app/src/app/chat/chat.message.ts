export class ChatMessage {

  userName: string;
  text: string;
  systemFlag: boolean;

  constructor(
    userName: string,
    text: string,
    systemFlag: boolean
  ) {
    this.userName = userName;
    this.text = text;
    this.systemFlag = systemFlag;
  }

}
