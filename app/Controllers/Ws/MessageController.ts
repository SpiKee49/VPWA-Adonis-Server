import Channel from 'App/Models/Channel'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import User from 'App/Models/User'
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

  public async onConnect({ socket, auth }: WsContextContract) {
    socket.join(`user-${auth.user!.userName}`)
    console.log('pripojil sa pouzivatel pod id: ' + socket.id)
  }

  public async joinRooms({ socket }: WsContextContract, channels: string[]) {
    channels.forEach((channelId) => socket.join(channelId))
    console.log(socket.rooms)
  }

  public async leaveRoom({ socket }: WsContextContract, channel: string) {
    socket.leave(channel)
    console.log(`Socket id: ${socket.id} left room ${channel}`)
  }

  public async addMessage(
    { socket, auth }: WsContextContract,
    payload: { channelId: number; message: string }
  ) {
    const message = await this.messageRepository.create(
      payload.channelId,
      auth.user!.id,
      payload.message
    )
    // broadcast message to all users in channel including sender
    const channel = payload.channelId.toString()
    socket.in(channel).emit('newMessage', { channelId: payload.channelId, message })
  }

  async inviteToChannel({ socket }: WsContextContract, invitedUserId: number) {
    const user = await User.findBy('id', invitedUserId)

    if (user == null) return

    socket.to(`user-${user.userName}`).emit('newChannelInvite')
  }

  public async deleteChannel({ socket, auth }: WsContextContract, channelId: number) {
    await Channel.query().where('id', channelId).andWhere('created_by', auth.user!.id).delete()

    socket.to(channelId.toString()).emit('channelDeleted', channelId)
  }
}
