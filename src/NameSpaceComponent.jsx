import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { useEffect } from 'react'
import { useMemo } from 'react'


export default function NameSpaceComponent(props){
  const { namespace, id, visible, uuid, Server_id, test, NS_chat, type, read } = props;
  const [chat, setchat] = useState([])
  const [filter_ns_chat, setfilter_ns_chat] = useState([]);
  const [readLen, setreadLen] = useState(0)
  const [message, setmessage] = useState("")
  const [currently_typing, setcurrently_typing] = useState({})
  const socket = useMemo(() => new WebSocket('ws://localhost:8080/' + namespace), []);
   let i = 0;
   console.log(test)
   socket.onopen = function(e) {
    
    console.log('socket is open')
    socket.send(JSON.stringify({opcode: 'open', NS: namespace}))
    console.log(id)
    
   
  };

  socket.onmessage = function(e) {
    const parse = JSON.parse(e.data)
    console.log(parse)
    if(parse.opcode === 'open'){
     console.log('message recieved from server')
    }
    if(parse.opcode === 'message') {
        setchat(prev =>{
            return [...prev, parse.message]
          })
    }
 }

useEffect(() => {
  Assort_array()
  Assort_typing()
}, [])

document.onvisibilitychange = () => {
    if(document.visibilityState === 'visible') {
      let a = 0;
      let read_identifier;
        for (let index = 0; index < filter_ns_chat.length; index++) {
               if(filter_ns_chat[index]['read'] === 'read') {
                a++
               }
        }
       read_identifier = filter_ns_chat[ filter_ns_chat.length - 1]
        if( a < readLen) {
          socket.send(JSON.stringify({opcode: 'message read', id: uuid.id, server_space_id: uuid.Server_id, reader_flag_id: read_identifier.uuid}))
          console.log('flag sent out on visi change') 
        }
    }
}
 

   const submit_1 = () => {
  
   
    socket.send(JSON.stringify({opcode: 'send to namespace', load: message, id: uuid.id, NS: namespace}))
    console.log('info sent')
    
  }

  const typing = (a_bool) => {
    if(a_bool === true) {
        socket.send(JSON.stringify({opcode: 'typing', load: 'typing...', id: uuid.id, server_space_id: uuid.Server_id}))
    } 

    if(!a_bool) {
      socket.send(JSON.stringify({opcode: 'blur', load: '', id: uuid.id, server_space_id: uuid.Server_id}))
    }
  }

  const FILTER_CHAT = () => {
    let a = 0;
    
       
     return (
        <div>
         {filter_ns_chat.map(cb => {
            a++
            return (
               <div key={a}>
                <p style={{display: 'flex'}}>{cb.uuid}:{" "}{cb.message} {" "} {cb.read === 'read' && cb.uuid === uuid.id ? <small>:: read</small> : null}</p>
               </div> 
            )
         })} 
        </div>

     )
    
  }

  const Assort_array = () => {
    for (let index = 0; index < NS_chat.length; index++) {
        let array = NS_chat
        let read_identifier;
         if(array.length > 0 && document.visibilityState === 'visible') {
           for (let z = 0; z < array.length; z++) {
            if(array[z]['namespace'] === namespace) {
             read_identifier = array[z]['NS_chat'][array[z]['NS_chat'].length - 1];
             
            }
            
           }
           deffered_read.then(resolve => {
            resolve.send(JSON.stringify({opcode: 'message read', id: uuid.id, server_space_id: uuid.Server_id, reader_flag_id: read_identifier.uuid}))
            console.log('flag sent')
           })
         
         }
        if(NS_chat[index]['namespace'] === namespace) {
          console.log(NS_chat[index]['NS_chat'][NS_chat[index]['NS_chat'].length -1])
           setreadLen(NS_chat[index]['NS_chat'].length)
           setfilter_ns_chat(NS_chat[index]['NS_chat'])
        }
       console.log(array)
    }
  }

  const Assort_typing = () => {
    for (let index = 0; index < type.length; index++) {
        if(type.length > 0) {
            if(type[index]['namespace'] === namespace) {
                setcurrently_typing(type[index])
            }
        }
    }    
  }

  
  const deffered_read = new Promise((resolve, reject) => {
       if(socket.readyState === 1) {
        resolve(socket)
       }
  })

  const Display_typing = () => {
    
    return (
        <small>{currently_typing.typing && currently_typing.typing}</small>
    )
  }
       


   const Chat_Window = () => {
     if(visible == true) {
    
       return <label>
          
          Send a message to {namespace}
          <input type='text'  value={message} onChange={(e) =>setmessage(e.target.value)}></input>
          <button onClick={() => submit_1()}>send</button>
        </label>
        
     
     } else {
       
        return null;
     }
   }


  return (
    <> 
    <div className='chat-window'>
    {chat.map(cb => {
        i++;
        return <div key={i}>
           {uuid.id}: {" "} {cb}
        </div>
    })}
    
     {NS_chat.length == 0 ? null:  <FILTER_CHAT/>}
      <Display_typing/>
    </div>
      {visible == true ? <label> Send a message to {namespace}
          <input type='text'  value={message} onChange={(e) =>setmessage(e.target.value)} onFocus={(e) =>typing(true)} onBlur={(e) => typing(false)} ></input>
          <button onClick={() => submit_1()}>send</button>
        </label>: null}
    </>
  )
}
