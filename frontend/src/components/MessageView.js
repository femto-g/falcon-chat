import React, { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";
import { useEffect, useState } from "react";

export function MessageView(props){

  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
	//since this runs every render, check if socket already has listeners for this event
  useEffect(() => {
    if(!socket.hasListeners('private message')){
      socket.on('private message', function(msg) {
        const message = msg;
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log("got message");
        console.log(msg)
      });
    } 
		//add cleanup
  },[]);

  const [message, setMessage] =  useState("");
  const handleMessageChange = (e) => {
      setMessage(e.target.value);

  }

  //converts array of messages into <li>
  //TODO: fix this to use actual unique keys later maybe date?
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
      //console.log(messages);
          setListItems(messages.map((message) =>
            //add a class here to <li> so we can right/left justify self and sender
              <li key={message}>{message}</li>
          ))
      }
  , [messages])


  //TODO: don't send on empty message
  const handleSubmit = (e) => {
      e.preventDefault();
      if(message && message.length != 0){
          socket.emit('private message', {
						message: message,
						to: props.receiver	
					});
					setMessages((prevMessages) => [...prevMessages, message]);
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