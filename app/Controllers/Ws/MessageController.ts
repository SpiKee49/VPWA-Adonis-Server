import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { inject } from '@adonisjs/core/build/standalone'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async onConnect({ socket }: WsContextContract) {
    console.log('pripojil sa gadzo pod id: ' + socket.id)
  }

  public async joinRooms({ socket }: WsContextContract, channels: string[]) {
    channels.forEach((channelId) => socket.join(channelId))
  }

  public async leaveRoom({ socket }: WsContextContract, channel: string) {
    socket.join(channel)
  }

  public async addMessage(
    { socket, auth }: WsContextContract,
    payload: { room: number; message: string }
  ) {
    await this.messageRepository.create(payload.room, auth.user!.id, payload.message)
    // broadcast message to other users in channel
    socket.to(payload.room.toString()).emit('newMessage')
    // return message to sender
  }
}
