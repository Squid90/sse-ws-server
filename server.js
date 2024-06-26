const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 7070 });
const onlineClients = new Map();

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {

    const mess = JSON.parse(message)
    const separatorIndex = mess.indexOf(':');
    if (message.includes('Ник:')) {
      let nickname = mess.slice(separatorIndex + 1);
      if (onlineClients.size !== 0) {
        onlineClients.forEach((value, key, map) => {
          if (nickname === value) {
            nickname = 0
          };
        });

        if (nickname === 0) {
          ws.send('Такой псевдоним уже занят.');
        } else {
          onlineClients.set(ws, nickname);
        };
        
      } else {
        onlineClients.set(ws, nickname); 
      };
    } else if(message.includes('Подключение')) {
      wss.clients.forEach((client) => { 
        const sendClients = [...onlineClients.values()].join(', ');
        client.send(`Онлайн:${sendClients}`);
      });
    } else {
      const nickname = mess.slice(0, separatorIndex);
      const clientMessage = mess.slice(separatorIndex + 1);
      wss.clients.forEach((client) => { 
        client.send(`${nickname}: ${clientMessage}`);
      });
    }
  });

  ws.on('close', function () {
    for (let currentClient of onlineClients.keys()) {
      if (currentClient === ws) {
        wss.clients.forEach((client) => {
          client.send(`${onlineClients.get(currentClient)} покинул чат.`);
        });
        onlineClients.delete(currentClient);
        return;
      }
    };
  });

// setInterval(() => {
//   wss.clients.forEach((client) => { 
//     const sendClients = [...onlineClients.values()].join(', ');
//     client.send(`Онлайн: ${sendClients}`);
//   });
// },5000)

});

const bootstrap = async () => {
    console.log(`Server has been started on http://localhost:7070`)
};
  
bootstrap();


