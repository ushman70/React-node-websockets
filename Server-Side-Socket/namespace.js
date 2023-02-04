

class Namespace {
    constructor(engine, namespace, WsServer){
        this.engine = engine;
        this.namespace = namespace;
        this.WsServer = WsServer;
        this.pool = new Map();

    }
   
    NameSpaceCreator(pool, WsServer){
       pool = this.pool;
       WsServer = this.WsServer;
       this.namespace.map(socket => {
       this.engine.ws('/' + socket, function(ws, req) {
        
            const aWss = WsServer.getWss(socket);
           
            ws.on('message', function(msg){
                const result = JSON.parse(msg)
                if(result.opcode === 'open') {
                    const broadcast = JSON.stringify({opcode: 'open', message: 'operational'})
                    ws.send(broadcast)
                }

                if(result.opcode === 'send to namespace') {
                    const broadcast = JSON.stringify({opcode: 'message namespace', message: result.load, id: result.id, NS: result.NS})
                    for(const item of pool) {
                        if(item[1] === socket) {
                            aWss.clients.forEach(client => {
                                if(client.id === item[0].server_space_id) {
                                    client.send(broadcast)
                                }
                             });
    
                        }
                      
                    }
                    
                  

                }

                if(result.opcode === 'typing') {
                  const broadcast = JSON.stringify({opcode: 'typing in namespace', NS: socket, id: result.id, load: 'typing...'})
                  for(const item of pool) {
                    if(item[1] === socket) {
                        aWss.clients.forEach(client => {
                            if(client.id === item[0].server_space_id) {
                               if(client.id !== result.server_space_id) {
                                client.send(broadcast)
                               }
                            }
                         });

                    }
                  
                }
                }

                if(result.opcode === 'blur') {
                    const broadcast = JSON.stringify({opcode: 'blur', NS: socket, id: result.id, load: ''})
                    for(const item of pool) {
                        if(item[1] === socket) {
                            aWss.clients.forEach(client => {
                                if(client.id === item[0].server_space_id) {
                                   if(client.id !== result.server_space_id) {
                                    client.send(broadcast)
                                   }
                                }
                             });
    
                        }
                      
                    }
                }

                if(result.opcode === 'message read') {
                    const broadcast = JSON.stringify({opcode: 'message namespace read', NS: socket, id: result.id, load: 'read', reader_flag_id: result.reader_flag_id})
                    for(const item of pool) {
                        if(item[1] === socket) {
                            aWss.clients.forEach(client => {
                                if(client.id === item[0].server_space_id) {
                                   if(client.id !== result.server_space_id) {
                                    client.send(broadcast)
                                   }
                                }
                             });
    
                        }
                      
                    }
                }
               
                
            })
            
        });
       })
 }

    JoinNameSpace(uuid, namespace, Server_id){
      const NS_id = {server_space_id: Server_id, user_id: uuid}
      return this.pool.set(NS_id, namespace) 
    }




}
module.exports = Namespace;