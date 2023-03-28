import React, { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import { useEffect, useState } from "react";
import './styles.css';
import { useQuery } from "@tanstack/react-query";

export function MessageView(props){

  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
	//since this runs every render, check if socket already has listeners for this event
  useEffect(() => {
    if(socket){
      if(!socket.hasListeners('private message')){
        socket.on('private message', function(msg) {
          //const message = msg.message;
          //const from = msg.from;
          if(msg.from === props.receiver){
            //set messages here, do something else like, notify of unread messages if not
          }
          setMessages((prevMessages) => [...prevMessages, msg]);
          console.log("got message");
          console.log(msg)
        });
      } 
    }
		//add cleanup
  },[socket]);

  const [message, setMessage] =  useState("");
  const handleMessageChange = (e) => {
      setMessage(e.target.value);

  }

  //converts array of messages into <li>
  //TODO: fix this to use actual unique keys later maybe date?
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
      console.log(messages);
          setListItems(messages.map((message) =>{
            //add a class here to <li> so we can right/left justify self and 
            let className = 'from-me';
            if(message.from === props.receiver){
              className = 'not-from-me'
            }
              return <li key={message} className={className}>{message.message}</li>
          }
          ))
      }
  , [messages])


  //TODO: don't send on empty message
  const handleSubmit = (e) => {
      e.preventDefault();
      console.log(`sending message as ${props.username}`);
      if(message && message.length != 0){
          socket.emit('private message', {
						message: message,
						to: props.receiver,
            from: props.username
					});
					setMessages((prevMessages) => [...prevMessages, {message: message, from: props.username}]);
          setMessage('');
      }

  }    

    
    return(
        <div className="MessageView">
          <header className="message-view-header">
            <h1>{props.receiver}</h1>
          </header>
            <ul id="messages">{listItems}</ul>
            <form id="form" onSubmit={handleSubmit}>
                <input id="input" autoComplete="off" value={message} onChange={handleMessageChange}/>
                <input className="button" type="submit" value="Send"/>
            </form>    
        </div>

    );
}