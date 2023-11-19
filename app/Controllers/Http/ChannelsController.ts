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
      channelsIds.forEach((channel) => qb.whereNot('id', channel))
    )

    //optional search queries
    console.log(request.qs())
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
    const members = await User.query()
      .whereNot('id', auth.user!.id)
      .preload('channels', (ChannelQuery) => {
        ChannelQuery.where('channel_id', request.params().id)
      })
    return members
  }

  async createChannel({ request, auth }: HttpContextContract) {
    const body = request.body() as { name: string; isPrivate: boolean }

    const channel = await Channel.create({
      createdBy: auth.user!.id,
      ...body,
    })
    await channel.load('owner')
    await auth.user!.related('channels').attach([channel.id])

    return channel
  }

  async deleteChannel({ request, auth }: HttpContextContract) {
    const channelId = request.params().id

    const channel = await Channel.query()
      .where('id', channelId)
      .andWhere('created_by', auth.user!.id)
      .delete()
  }

  async inviteToChannel({ request }: HttpContextContract) {
    const body = request.body() as { userId: number }

    const user = await User.findBy('id', body.userId)

    if (user == null) return new Error('User not found in DB based on id')

    return await user.related('channels').attach([request.params().id])
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
