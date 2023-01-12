import './App.css';
import { io } from "socket.io-client";
import {useEffect, useState} from 'react';

//going to seperate this into components later
function App() {
  
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    console.log("connecting");
    setSocket(io('http://localhost:3001/'));

    return () => {
      if(socket){
        socket.close();
      }
    }
  }, []);

  //adds each new message to array
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if(socket){
      socket.on('chat message', function(msg) {
        // var item = document.createElement('li');
        // item.textContent = msg;
        // messages.appendChild(item);
        // window.scrollTo(0, document.body.scrollHeight);
        //add messages
        //const li = "<li>" + {msg} + "</li>";
        const message = msg;
        setMessages((prevMessages) => [...prevMessages, message]);

      });
    }
  }, [socket]);

  //converts array of messages into <li>
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
    setListItems(messages.map((message) =>
    <li key={message}>{message}</li>
     ))
  }
  )

  const [message, setMessage] =  useState("");
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if(message){
      socket.emit('chat message', message);
      setMessage('');
    }
  }

  return (
    <div className="App">
      <ul id="messages">{listItems}</ul>
      <form id="form" onSubmit={handleSubmit}>
        <input id="input" autoComplete="off" value={message} onChange={handleMessageChange}/>
        <input className="button" type="submit" value="Send"/>
      </form>
    </div>
  );
}

export default App;
