import React, { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import { useEffect, useState } from "react";
import './styles.css';
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function MessageView(props){

  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);

  const queryClient = useQueryClient();
	//since this runs every render, check if socket already has listeners for this event
  useEffect(() => {
    console.log("attaching private message listener");

    const privateMessageListener = (msg) => {
      console.log("private message received");
          if(msg.sender === props.receiver){
            //set messages here, do something else like, notify of unread messages if not
            setMessages((prevMessages) => [...prevMessages, msg]);
            console.log("got message");
            console.log(msg.content);
          }

          else{
            //do something here like make notification.
            //invalidates userList queries so notifications will be up to date when a message is sent in background
            //set to null for some reason
            console.log(`invalidating userlist for ${props.username}`);
            queryClient.invalidateQueries({queryKey: ["userList", props.username]});
          }
    }
    if(socket){
      console.log("socket exists");
      //if(!socket.hasListeners('private message') && props.username != null){
        //console.log("socket has no listeners");
        socket.on('private message', privateMessageListener);
      //} 
    }
		//add cleanup
    return () => socket.off('private message', privateMessageListener);
  }, []);

  const [message, setMessage] =  useState("");
  const handleMessageChange = (e) => {
      setMessage(e.target.value);

  }

  //converts array of messages into <li>
  //TODO: fix this to use actual unique keys later maybe date?
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
      //console.log(messages);
          setListItems(messages.map((message) =>{
            //add a class here to <li> so we can right/left justify self and 
            let className = 'from-me';
            if(message.sender === props.receiver){
              className = 'not-from-me'
            }
              return <li key={message.timestamp} className={className}>{message.message}</li>
          }
          ))
      //console.log(`list items: ${listItems}`);
      //setListItems([]);
      }
  , [messages])


  //TODO: don't send on empty message
  const handleSubmit = (e) => {
      e.preventDefault();
      console.log(`sending message as ${props.username}`);
      if(message && message.length != 0){

        let messageObject = {
          message: message,
          receiver: props.receiver,
          sender: props.username,
          timestamp: new Date().toISOString()
        };
          socket.emit('private message', messageObject);
					setMessages((prevMessages) => [...prevMessages, messageObject]);
          setMessage('');
          queryClient.invalidateQueries({queryKey: ["userList", props.username]});
      }

  }    

  //react-query to load messages from server
  const messagesQuery = useQuery({
    queryKey: ['messages', props.username, props.receiver],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({user1: props.username, user2: props.receiver}),
        headers: {"content-type" : "application/json"}
		  });
      if(!response.ok){
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const formatedMessages = data.map((row) => {
        return {sender: row.sender, message: row.content, timestamp: row.timestamp}
      });
      setMessages(formatedMessages);
    }
  });

  if(messagesQuery.isLoading){
    //do something
  }
  if(messagesQuery.isError){
    //handle err
  }
  // if(messagesQuery.data){
  //   const messageData = messagesQuery.data;

  //   const formatedMessages = messageData.map((row) => {
  //     return {sender: row.sender, message: row.content}
  //   });

  //   if(messages != formatedMessages)
  //   //setMessages(formatedMessages);
  // }


    
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