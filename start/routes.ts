/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post(':id/messages', 'ChannelsController.loadMessages')
  Route.post('new', 'ChannelsController.createChannel').middleware('auth')
  Route.post(':id/invite', 'ChannelsController.inviteToChannel').middleware('auth')
  Route.get(':id/leave', 'ChannelsController.leaveChannel').middleware('auth')
  Route.post(':id/join', 'ChannelsController.joinChannel').middleware('auth')
  Route.put(':id/kick', 'ChannelsController.kickMember').middleware('auth')
  Route.put(':id/ban', 'ChannelsController.banMember').middleware('auth')
  Route.get(':id/members', 'ChannelsController.loadMembers').middleware('auth')
  Route.get('joinable', 'ChannelsController.loadPublicChannels').middleware('auth')
}).prefix('channels')

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
}).prefix('auth')
