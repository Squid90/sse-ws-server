const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 7070 });
const onlineClients = new Map();

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {

    const mess = JSON.parse(message)
    const separatorIndex = mess.indexOf(':');
    if (message.includes('Ник:')) {
      const nickname = mess.slice(separatorIndex + 1);
      if (onlineClients.has(nickname)) {
        ws.send('Такой псевдоним уже занят.');
      } else {
        onlineClients.set(ws, nickname); 
      }
    } else {
      const nickname = mess.slice(0, separatorIndex);
      const clientMessage = mess.slice(separatorIndex + 1);
      wss.clients.forEach(function each(client) { 
        client.send(`${nickname}: ${clientMessage}`);
      });
    }
  });

  ws.on('close', function () {
    for (let currentClient of onlineClients.keys()) {
      if (currentClient === ws) {
        wss.clients.forEach(function each(client) {
          client.send(`${onlineClients.get(currentClient)} покинул чат.`);
        });
        onlineClients.delete(currentClient);
        return;
      }
    };
  });

setInterval(() => {
  wss.clients.forEach(function each(client) { 
    const sendClients = [...onlineClients.values()].join(', ');
    client.send(`Онлайн: ${sendClients}`);
  });
},5000)

});

const bootstrap = async () => {
    console.log(`Server has been started on http://localhost:7070`)
};
  
bootstrap();


