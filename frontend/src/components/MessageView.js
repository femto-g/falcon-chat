import React, { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";
import { useEffect, useState } from "react";

export function MessageView(){

  const { socket } = useContext(SocketContext);

  //sets adds each new message to array triggered when socket object is instantiated
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if(socket){
      socket.on('chat message', function(msg) {
        const message = msg;
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log("got message");
        //console.log(messages);
      });
    } 
  },[socket]);

  const [message, setMessage] =  useState("");
  const handleMessageChange = (e) => {
      setMessage(e.target.value);

  }

  //converts array of messages into <li>
  //TODO: fix this to use actual unique keys later
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
      //console.log(messages);
          setListItems(messages.map((message) =>
              <li key={message}>{message}</li>
          ))
      }
  , [messages])


  //TODO: don't send on empty message
  const handleSubmit = (e) => {
      e.preventDefault();
      if(message){
          socket.emit('chat message', message);
          setMessage('');
      }
  }    

    
    return(
        <div className="MessageView">
            <ul id="messages">{listItems}</ul>
            <form id="form" onSubmit={handleSubmit}>
                <input id="input" autoComplete="off" value={message} onChange={handleMessageChange}/>
                <input className="button" type="submit" value="Send"/>
            </form>    
        </div>

    );
}