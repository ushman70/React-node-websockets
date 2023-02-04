var events_1 = require('events');
const WebSocket = require('ws');
const Sender = require('./sender');




class Socket_Server extends events_1.EventEmitter {
    constructor(socket,args){
        super();
        this.args = args;
        this.clients = new Set();
        this.rooms = new Set();
        this._sender = new Sender(socket, this._extensions);
        this._extensions = {};
        this._readyState = WebSocket.CONNECTING;
        
        
    }

    send(data, options, cb) {
        
        if (typeof options === 'function') {
          cb = options;
          options = {};
        }
    
        if (typeof data === 'number') data = data.toString();
    
        
    
        const opts = {
          binary: typeof data !== 'string',
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
    
        
    
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
    
}

module.exports = Socket_Server;