import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'

import { DateTime } from 'luxon'
import Message from './Message'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>
}
