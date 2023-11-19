import express from 'express';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './types/Message';

const PORT = process.env.PORT || 5000;
const app = express();

const messages: Message[] = [];
const emitter = new EventEmitter();

const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  client.send(JSON.stringify(messages));

  client.on('message', (text) => {
    const message: Message = {
      id: uuidv4(),
      text: text.toString(),
    };

    messages.unshift(message);
    emitter.emit('message', message);
  });
});

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify([message]));
  }
});
