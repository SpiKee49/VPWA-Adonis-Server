import Channel from 'App/Models/Channel'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import { SerializedMessage } from '@ioc:Repositories/MessageRepository'

export default class ChannelsController {
  async loadMessages({ request }: HttpContextContract) {
    const messages = await Message.query()
      .where('channelId', request.params().id)
      .orderBy('id', 'desc')
      .limit(20)
      .offset(request.body().offset ?? 0)
      .preload('author')

    return messages.map((msg) => msg.serialize() as SerializedMessage)
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
}
