import './App.css';
import { io } from "socket.io-client";
import {useEffect, useState} from 'react';
import { SocketContext } from './contexts/SocketContext';
import { MessageView } from './components/MessageView';

function App() {
  
  const [socket, setSocket] = useState(null);
  console.log("rendering");

  
  useEffect(() => {
    setSocket(io('http://localhost:3001/'));
    console.log("connecting");
    return () => {
      if(socket){
        socket.close();
      }
    }
  }, []);


  return (
    <div className="App">
      <SocketContext.Provider value={{socket}}>
        <MessageView/>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
