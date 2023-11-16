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

  public async loadMessages({ params }: WsContextContract) {
    return this.messageRepository.getAll(params.id)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, payload: string) {
    const message = await this.messageRepository.create(params.id, auth.user!.id, payload)
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)
    // return message to sender
    return message
  }
}
