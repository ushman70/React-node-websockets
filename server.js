var express = require('express');
const WebSocket = require('ws');
const app = express()
const wsExpress = require('express-ws')(app)
const ws = new WebSocket('ws://localhost:8080')
const wss = new WebSocket.Server({noServer: true});
var aWss = wsExpress.getWss('/');
const http = require('http')
const fs = require('fs')
const bodyparser = require('body-parser')
const cors = require('cors')
var events_1 = require('events');
const {v4 : uuidv4} = require('uuid')
const namespaceserver = require('./Server-Side-Socket/namespace')
let pool = []
let namespace = []

let q = 0;
// setInterval(() => {
//  run_namespace_server.NameSpaceCreator();
// }, 1);






const corsoptions = {
    origin: ["http://localhost:8080"],
    methods: ["GET,PUT,POST,DELETE,PATCH,OPTIONS"],
    credentials: true,
    allowedHeaders: `Accept,Accept-Language,Content-Language,Content-Type,Authorization,Cookie,X-Requested-With,Origin,Host`,
    optionsSuccessStatus: 200
};

app.use(cors(corsoptions))
let i = 0;

app.use(function (req, res, next) {
  i++;
  aWss.clients.forEach(client =>{
    if(client.id === undefined){
      client.id = i;
      req.id = i;
    }
  })
  return next();
});

const run_namespace_server = new namespaceserver(app, namespace, wsExpress);

 while (namespace.length > 0) {
  run_namespace_server.NameSpaceCreator();
 }

app.ws('/', function(ws, req) {

 
  
  ws.on('message', function(msg) {
   console.log(msg)
   const result = JSON.parse(msg)
   
   if(result.opcode === 'open'){
    
    const uuid = uuidv4()
    pool.push(uuid)
    const ID = {opcode: 'open', id: uuid, SocketID: req.id, users: pool, NS: namespace}
 
    const res = JSON.stringify(ID)
    ws.send(res)
    aWss.clients.forEach(function (client) {
      
      const broadcast = JSON.stringify({opcode: 'new connection', user: pool})
      client.send(broadcast);
    });
   }

   if(result.opcode === 'message'){ 
   
    aWss.clients.forEach(function (client) {
     
      const broadcast = JSON.stringify({opcode: 'message', message: 'hello', user: client, SocketID: client.id})
       
       if(client.id === 3){
        return
       } else {
        client.send(broadcast);
       }
      
    });
   }

   if(result.opcode === 'build_namespace') {
     namespace.push(result.NS_name)
     run_namespace_server.JoinNameSpace(result.id, result.NS_name, result.NS_server_id)
     run_namespace_server.NameSpaceCreator();
     aWss.clients.forEach(function (client) {
      const broadcast = JSON.stringify({opcode: 'new_namespace', new_namespace: namespace, NS: result.NS_name})
      client.send(broadcast)

     })
   }

   if(result.opcode === 'Join Namespace') {
    
    run_namespace_server.JoinNameSpace(result.id, result.NS_name, result.NS_server_id)
    run_namespace_server.NameSpaceCreator();

   }

   if(result.opcode === 'close'){
    for(const item of aWss.clients){
      if(result.Server_id === item.id){
        aWss.clients.delete(item)
        let filter = pool.filter(cb => cb !== result.id)
        pool = filter;
        console.log('client was deleted')
        console.log(pool)
      }
    }
   }

   if(result.opcode === 'send to namespace') {
    
  
   }
  
    
  });

  
 
  
});





app.listen(8080)








 



  
  



    





 