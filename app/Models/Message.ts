import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

import Channel from './Channel'
import { DateTime } from 'luxon'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public createdBy: number

  @column()
  public channelId: number

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>
}
