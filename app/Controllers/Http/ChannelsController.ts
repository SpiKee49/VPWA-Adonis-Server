import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import { SerializedMessage } from '@ioc:Repositories/MessageRepository'

export default class ChannelsController {
  async loadMessages({ request }: HttpContextContract) {
    const messages = await Message.query().where('channelId', request.params().id)

    return messages.map((msg) => msg.serialize() as SerializedMessage)
  }
}
