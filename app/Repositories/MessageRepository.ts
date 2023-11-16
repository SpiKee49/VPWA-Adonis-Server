import Channel from 'App/Models/Channel'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'

export default class MessageRepository implements MessageRepositoryContract {
  public async create(channelId: number, userId: number, rawMessage: string): Promise<void> {
    const channel = await Channel.findByOrFail('id', channelId)
    const message = await channel
      .related('messages')
      .create({ createdBy: userId, content: rawMessage })
    await message.load('author')
  }
}
