
export class GameCommand {
    private roomId: string;
    private userName: string;
    private command: number;


  constructor(roomId: string, userName: string, command: number) {
    this.roomId = roomId;
    this.userName = userName;
    this.command = command;
  }

}
