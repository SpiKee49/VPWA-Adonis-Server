import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

import Channel from './Channel'
import { DateTime } from 'luxon'
import User from './User'

export default class Ban extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public bannedBy: number

  @column()
  public channelId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'bannedBy' })
  public ban: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'bannedUserId' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Channel, { foreignKey: 'channelId' })
  public channel: BelongsTo<typeof Channel>
}
