import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'
    await Channel.updateOrCreateMany(uniqueKey, [{ name: 'general' }])
  }
}
