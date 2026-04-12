export class SocketService {
  constructor(
    private io: any,
    private userSocketMap: Map<string, string>,
  ) {}

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSocketMap.get(userId);

    if (!socketId) return;

    this.io.to(socketId).emit(event, data);
  }
}
