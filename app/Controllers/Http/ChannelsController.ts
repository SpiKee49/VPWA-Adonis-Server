import Channel from 'App/Models/Channel'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import { SerializedMessage } from '@ioc:Repositories/MessageRepository'
import User from 'App/Models/User'

export default class ChannelsController {
  async loadPublicChannels({ request, auth }: HttpContextContract) {
    //channels user is not in
    const user = await User.query().where('id', auth.user!.id).preload('channels').first()
    const channelsIds = user?.channels.map((channel) => channel.id) ?? []

    let publicChannels = Channel.query().where((qb) =>
      channelsIds.forEach((channel) => qb.whereNot('id', channel).andWhere('is_private', false))
    )

    if (request.qs().search && request.qs().search !== '')
      publicChannels.where('name', 'like', `%${request.qs().search}%`)

    return await publicChannels
  }

  async loadMessages({ request }: HttpContextContract) {
    const messages = await Message.query()
      .where('channelId', request.params().id)
      .orderBy('id', 'desc')
      .limit(20)
      .offset(request.body().offset ?? 0)
      .preload('author')

    return messages.map((msg) => msg.serialize() as SerializedMessage)
  }

  async loadMembers({ request, auth }: HttpContextContract) {
    const channelId = request.params().id

    const channel = await Channel.query().where('id', channelId).firstOrFail()
    await channel.load('members')

    return channel.members.filter((user) => user.id !== auth.user!.id)
  }

  async inviteToChannel({ request, response }: HttpContextContract) {
    const channelId = request.params().id
    const inviteUserName = request.body().inviteUserName

    const user = await User.findBy('user_name', inviteUserName)

    if (user == null) {
      return response.status(404).json({ message: 'User not found in database' })
    }

    await user.related('channels').attach([channelId])
    return response.status(200)
  }

  async createChannel({ request, auth }: HttpContextContract) {
    const body = request.body() as { name: string; isPrivate: boolean }

    let channel = await Channel.create({
      createdBy: auth.user!.id,
      ...body,
    })
    await channel.load('owner')
    await auth.user!.related('channels').attach([channel.id])
    await channel.load('members')

    return channel
  }

  async joinChannel({ request, auth }: HttpContextContract) {
    const channelId = request.params().id

    return await auth.user!.related('channels').attach([channelId])
  }

  async leaveChannel({ request, auth }: HttpContextContract) {
    const channelId = request.params().id

    return await auth.user!.related('channels').detach([channelId])
  }
}
