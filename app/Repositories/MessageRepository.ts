import type {
  MessageRepositoryContract,
  SerializedMessage,
} from '@ioc:Repositories/MessageRepository'

import Channel from 'App/Models/Channel'

export default class MessageRepository implements MessageRepositoryContract {
  public async create(channelId: number, userId: number, rawMessage: string) {
    const channel = await Channel.findByOrFail('id', channelId)
    const message = await channel
      .related('messages')
      .create({ createdBy: userId, content: rawMessage })
    await message.load('author')
    return message.serialize() as SerializedMessage
  }
}
