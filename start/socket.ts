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
Ws.io.on('connection', (socket) => {
  console.log('connected by id: ' + socket.id)
})

Ws.namespace('channels/:id')
  // .middleware('channel') // check if user can join given channel
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
