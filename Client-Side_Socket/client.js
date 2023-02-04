import { EventEmitter } from 'events'


 export class Client extends EventEmitter {
    constructor(args){
        super();
        this.args = args;
        this.server = new WebSocket('ws://localhost:8080')
    }

    emit_to_server(args){
        this.emit('open', args);

    }
}
