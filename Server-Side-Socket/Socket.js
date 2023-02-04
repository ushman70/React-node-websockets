const events_1 = require('events');


class Socket {
    constructor(req){
     this.req = req;
    }

    buildhandshake(req){
      let validator = true;
      const { host, upgrade, Connection, Seckey, Secwbversion } = req;   
      const socket_request = [{host: host}, {upgrade: upgrade},{Connection: Connection}, {Seckey: Seckey}, {Secwbversion :Secwbversion}];

      for (let index = 0; index < socket_request.length; index++) {
          if(socket_request[1].upgrade != 'websocket'){
            validator = false;
            break;
          }

          if(socket_request[2].Connection != 'Upgrade'){
            validator = false;
            break;
          }

          if(socket_request[3].Seckey != 'dGhlIHNhbXBsZSBub25jZQ=='){
            validator = false;
            break;
          }

          if(socket_request[4].Secwbversion != 13){
            validator = false;
            break;
          }
        
      }
      return validator;
       
    }
}

exports.Socket = Socket;