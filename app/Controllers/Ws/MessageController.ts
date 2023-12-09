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

interface CurrentlyTypingChannels {
  [channelId: number]: Map<string, string>
}

@inject(['Repositories/MessageRepository'])
export default class MessageController {
  private typingChannels: CurrentlyTypingChannels = {}

  constructor(private messageRepository: MessageRepositoryContract) {}

  public async onConnect({ socket, auth }: WsContextContract) {
    socket.join(`user-${auth.user!.userName}`)
    // console.log('pripojil sa pouzivatel pod id: ' + socket.id)
  }

  public isTyping({ socket, auth }: WsContextContract, channelId: number, message: string) {
    if (channelId in this.typingChannels) {
      if (!this.typingChannels[channelId].has(auth.user!.userName) && message === '') {
        return
      }

      if (this.typingChannels[channelId].has(auth.user!.userName) && message === '') {
        this.typingChannels[channelId].delete(auth.user!.userName)
      } else {
        this.typingChannels[channelId].set(auth.user!.userName, message)
      }
    } else if (!(channelId in this.typingChannels) && message !== '') {
      this.typingChannels[channelId] = new Map<string, string>()
      this.typingChannels[channelId].set(auth.user!.userName, message)
    }
    try {
      socket
        .to(channelId.toString())
        .emit(
          'someIsTyping',
          channelId,
          JSON.stringify(Array.from(this.typingChannels[channelId].entries()))
        )
    } catch (error) {
      socket.to(channelId.toString()).emit('someIsTyping', channelId, JSON.stringify([]))
    }
  }

  public async updateStatus({ socket, auth }: WsContextContract, status: 1 | 2 | 3) {
    auth.user!.status = status
    await auth.user!.save()

    socket.broadcast.emit('statusChanged', auth.user!.id)
  }

  public async joinRooms({ socket, auth }: WsContextContract) {
    await auth.user!.load('channels')

    auth.user!.channels.forEach((channel) => {
      socket.join(channel.id.toString())
    })
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

  userLeftChannel({ socket }: WsContextContract, channelId: number, userName: string) {
    socket.to(channelId.toString()).emit('updateMembers', channelId)
    socket.to(`user-${userName}`).emit('channelDeleted', channelId)
  }

  public async inviteToChannel(
    { socket }: WsContextContract,
    inviteUserName: string,
    channelId: number
  ) {
    const user = await User.findBy('userName', inviteUserName)
    if (user == null) {
      console.log('user not found')
      return
    }

    socket.to(`user-${user.userName}`).emit('newChannelInvite', channelId)
  }

  public async deleteChannel({ socket, auth }: WsContextContract, channelId: number) {
    await Channel.query().where('id', channelId).andWhere('created_by', auth.user!.id).delete()
    console.log('Notifying about channel delete: ' + channelId)
    socket.to(channelId.toString()).emit('channelDeleted', channelId)
  }
}
