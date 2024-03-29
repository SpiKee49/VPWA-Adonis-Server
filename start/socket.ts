/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

// this is dynamic namespace, in controller methods we can use params.name

Ws.namespace('/channels')
  .connected('MessageController.onConnect')
  .on('joinRooms', 'MessageController.joinRooms')
  .on('leaveRoom', 'MessageController.leaveRoom')
  .on('leaveRooms', 'MessageController.leaveRooms')
  .on('userLeftChannel', 'MessageController.userLeftChannel')
  .on('sendingPayload', 'MessageController.sendPayload')
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('deleteChannel', 'MessageController.deleteChannel')
  .on('invite', 'MessageController.inviteToChannel')
  .on('typing', 'MessageController.isTyping')
  .on('updateStatus', 'MessageController.updateStatus')
