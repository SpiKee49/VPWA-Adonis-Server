// here we are declaring our MessageRepository types for Repositories/MessageRepository
// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
  export interface SerializedMessage {
    createdBy: number
    content: string
    channelId: number
    createdAt: string
    updatedAt: string
    id: number
    author: {
      id: number
      email: string
      createdAt: string
      updatedAt: string
    }
  }

  export interface MessageRepositoryContract {
    create(channelId: number, userId: number, content: string): Promise<void>
  }

  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}
