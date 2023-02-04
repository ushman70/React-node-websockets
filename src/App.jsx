import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import NameSpaceComponent from './NameSpaceComponent'
import './App.css'
import { useEffect } from 'react'
import { useMemo } from 'react'

function App() {
 




  const [count, setCount] = useState(0)
  const [input, setinput] = useState("")
  const [chat, setChat] = useState([])
  const [uuid, setuuid] = useState({});
  const [users, setusers] = useState([])
  const [read, setread] = useState([])
  const [namespacechat, setnamespacechat] = useState([]) // Transfer message to specific namespace
  const [room, setroom] = useState([])  //This is for the namespace
  const [room_visi, setroom_visi] = useState([]) // Rooms you can enter
  const [roominput, setroominput] = useState("")
  const [typing, settyping] = useState([])
  const [testviz, settestviz] = useState([{name: 'test1', visi: false}, {name: 'test2', visi: false}, {name: 'test3', visi: false}])
  const controller = new AbortController();
  const signal = controller.signal;
  let i = 0;
  let c = 0;
  const socket = useMemo(() => new WebSocket('ws://localhost:8080'), [])
  

 
  window.addEventListener("beforeunload", (event) => {
    let obj = {opcode: 'close', id: uuid.id, Server_id: uuid.Server_id}
    socket.send(JSON.stringify(obj))
    
  });
  


 

  socket.onopen = function(e) {
    
    
    socket.send(JSON.stringify({opcode: 'open'}))
    console.log(socket)
    
   
  };

  
    socket.onclose = function(e) {
      console.log('closing')
      let obj = {opcode: 'close', id: uuid}
      socket.send(JSON.stringify(obj))
      
    }
  

 
  socket.onmessage = function(e) {
    const parse = JSON.parse(e.data)
    console.log(parse)
    if(parse.opcode === 'open'){
      setuuid({id: parse.id, Server_id: parse.SocketID})
     if(parse.NS.length > 0) {
      setroom(parse.NS);
      setroom_visi(() => {
        return [{room_name:parse.NS[parse.NS.length - 1], visibility: false}]
      })
     }
    }

    if(parse.opcode === 'message'){
      console.log('chatting')
      setChat(prev =>{
        return [...prev, parse.message]
      })
       setinput(prev => {
        return [...prev, parse.message]
       })
    }

    if(parse.opcode === 'new connection'){
     setusers(parse.user)
    }

    if(parse.opcode === 'new_namespace') {
      setroom(parse.new_namespace)
      setroom_visi(prev => {
        console.log(parse.new_namespace[parse.new_namespace.length - 1])
        return [...prev, {room_name: parse.new_namespace[parse.new_namespace.length - 1], visibility: false}]
      })
      setnamespacechat(prev => {
        if(namespacechat.length === 0 ) {
          return [{namespace: parse.NS, NS_chat: []}]
        } else {
          return [...prev, {namespace: parse.NS, NS_chat: []}]
        }
      })

      settyping(prev => {
        return [...prev, {namespace: parse.NS, typing: ''}]
      })
      setread(prev => {
        return [...prev, {namespace: parse.NS, array: []}]
      })
    }

    if(parse.opcode === 'message namespace') {
      setnamespacechat(prev => {
        for (let index = 0; index < prev.length; index++) {
           if(prev[index]['namespace'] === parse.NS) {
            prev[index]['NS_chat'] = [...prev[index]['NS_chat'], {uuid: parse.id, message: parse.message, read:''}]
           }
          
        }
        return [...prev]
      })
    }

    if(parse.opcode === 'typing in namespace') {
      settyping(prev => {
        for (let index = 0; index < prev.length; index++) {
          if(prev[index]['namespace'] === parse.NS) {
           prev[index]['typing'] = parse.load
          }
         
       }
       return [...prev]
      })
    }

    if(parse.opcode === 'blur') {
      settyping(prev => {
        for (let index = 0; index < prev.length; index++) {
          if(prev[index]['namespace'] === parse.NS) {
           prev[index]['typing'] = parse.load
          }
         
       }
       return [...prev]
      })
    }

    if(parse.opcode === 'message namespace read') {
       console.log('flag recieved from server')
      setnamespacechat(prev => {
        for (let index = 0; index < prev.length; index++) {
           if(prev[index]['namespace'] === parse.NS) {
            for (let b = 0; b < prev[index]['NS_chat'].length; b++) {
              if(prev[index]['NS_chat'][b]['read'] === '' && prev[index]['NS_chat'][b]['uuid'] === parse.reader_flag_id) {
                prev[index]['NS_chat'][b]['read'] = 'read'
                console.log('changed to read')
              }
              
            }
           }
          
        }
        return [...prev]
      })
    }

  }
 
  const close = () =>{
    let obj = {opcode: 'close', uuid: uuid}
    socket.send(JSON.stringify(obj))
    socket.close()
  }
   
  const submit = () => {
  
    const myobj = {opcode: 'message',message: input, id: uuid}
    socket.send(JSON.stringify(myobj));
    console.log('info sent')
    
  }

  const create_room = () => {
    const myobj = {opcode: 'build_namespace', NS_name: roominput, id: uuid}
    socket.send(JSON.stringify(myobj));
    setroominput("")
  }

  const memoize_input = useCallback((e) =>{
    
    console.log(e.target.value)
       setinput(e.target.value);
      
  }, [input])

  const VISI_INIT_LOOPED_NAMESPACE = (param) => {
       for (let index = 0; room_visi < array.length; index++) {
         if(param === room_visi[i]['room_name'] && room_visi[i]['visibility'] === true) {
          return;
         } else {

         }
        
       }
  }

  const toggle = (name) => {
    console.log(name)
    setroom_visi(prev => {
      for (let index = 0; index < room_visi.length; index++) {
         if(prev[index]['room_name'] === name) {
           let obj = JSON.stringify({opcode: 'Join Namespace', id: uuid.id, NS_name: name, NS_server_id: uuid.Server_id})
           socket.send(obj)
           console.log('payload sent')
           prev[index]['visibility'] = !prev[index]['visibility'];
         }
        
      }
      return [...prev]
    })
  }
  
  const LOOPED_NAMESPACE = (props) => {
     
     if(room.length > 0) {
     let i = 0;
    return room.map(cb => {
      
    
      return ( <span key={i}>
       <button onClick={() => toggle(cb)}>
       {room_visi[i]['visibility'] === true ? 'Leave Room' + " " + room[i] : 'Join' + " " + room[i]}
       </button>
     <NameSpaceComponent  namespace={cb} id={i} visible={room_visi[i]['visibility']} uuid={uuid} Server_id={uuid.Server_id} test={input} NS_chat={namespacechat}
     type={typing} read={read}
     />
     <div style={{display: 'none'}}>{i++}</div>
    </span>
     
    )})   

     
     
   } else {
    return null;
   }
  }



  const Test1 = (props) => {
   const { visi } = props
    if(visi === false) {
      return <div>false!</div>
    }

    if(visi === true) {
      return <div>true!</div>
    }
  }

  const toggle_viz = (param) => {
    console.log('clicked')
     settestviz(prev => {
      for (let index = 0; index < testviz.length; index++) {
          if(prev[index]['name'] === param) {
              prev[index]['visi'] = !prev[index]['visi']
          }
        
      }

      return [...prev]
     })
  }

 
 
 
  
  
  return (
    <div className="App">
    
      <span>
        <label>Create a room</label>
        <input value={roominput} type="text" onChange={(e) => setroominput(e.target.value)}></input> 
        <button onClick={() => create_room()}> Create room</button>
      </span>
      <span>
        <LOOPED_NAMESPACE check={room}/>
      </span>
      <h1>Your id is {uuid.id}</h1>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
         <label>
         Send input to back-end
           <input value={input} type="text" onChange={(e) => memoize_input(e)}></input>
         </label>
         <button onClick={() =>submit(input)}>Send</button>
        </p>
      </div>
      <button onClick={() => close()}>Close</button>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      
       {chat.length !== 0 && chat.map(cb =>{
        i++;
        return <p key={i}>{cb}</p>
       })}
       <div>
        <p>Users</p>
         {users && users.map(cb=>{
          c++;
             return <div key={c}>{cb}</div>
         })}
       </div>
    </div>
  )
}

export default App
