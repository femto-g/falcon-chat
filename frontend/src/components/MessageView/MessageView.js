import React, { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import { useEffect, useState } from "react";
import './styles.css';
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function MessageView(props){

  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);

  const queryClient = useQueryClient();
//BUG this props.receiver is set to the receiver on first render of messageview meaning that any
//other senders will not be immediately updated when active except by react-query default invalidation
const [privateMessageListenerRef, setPrivateMesageListenerRef] = useState();
  useEffect(() => {

    if(privateMessageListenerRef && socket){
      socket.off('private message', privateMessageListenerRef);
    }
    const privateMessageListener = (msg) => {
      //console.log(`Received: ${msg.message} from ${msg.sender} receiver : ${props.receiver}`);
          if(msg.sender === props.receiver){
            setMessages((prevMessages) => [...prevMessages, msg]);
          }
          else{
            queryClient.invalidateQueries({queryKey: ["userList", props.username]});
          }
    };
    setPrivateMesageListenerRef(() => privateMessageListener);

    if(socket){
        socket.on('private message', privateMessageListener);
    }
		//cleanup
    return () => socket.off('private message', privateMessageListener);
  }, [props.receiver]);

  const [message, setMessage] =  useState(``);
  const handleMessageChange = (e) => {
      setMessage(e.target.value);

  }

  //converts array of messages into <li>
  const [listItems, setListItems] = useState([]);
  useEffect(() => {
          setListItems(messages.map((message) =>{
            let className = 'from-me';
            if(message.sender === props.receiver){
              className = 'not-from-me'
            }
            return <li key={message.timestamp} className={className}>{message.message}</li>
          }
          ))
          //switch to message view on mobile when new messages are loaded?
      }
  , [messages])


  //TODO: don't send on empty message
  const handleSubmit = (e) => {
      e.preventDefault();
      if(message && message.length !== 0){
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
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/messages`, {
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
    //do something, set messages to nothing i guess?
  }
  if(messagesQuery.isError){
    //handle err
  }

  const [prevReceiver, setPrevReceiver] = useState();
  useEffect(() => {
    if(props.receiver){
      if(prevReceiver !== props.receiver ){
        props.switchToMessageView();
        setPrevReceiver(props.receiver);
      }
    }

  }, [listItems]);

  const onBackButtonClick = () => {
    props.switchToUserSelect();
    props.selectUser(null);
    setPrevReceiver(null);
    
  }


  if(!props.receiver){
    return(
      <div className="MessageView-empty">
        <h1>No conversation selected</h1>
        <p>Find a friend and start chatting!</p>
      </div>
    )
  }

  
    
  else{

    return(
        <div className={"MessageView " + (props.active ? "active" : "inactive")}>
          <header className="message-view-header border">
            <button className="back-button border" onClick={onBackButtonClick}>Back</button>
            <h1 className="receiver-heading">{props.receiver}</h1>
          </header>
            <ul className="message-list" id="messages">{listItems}</ul>
            <form id="form" onSubmit={handleSubmit}>
                <input className="message-input" id="input" autoComplete="off" value={message} onChange={handleMessageChange}/>
                <input className="submit-button" type="submit" value="Send"/>
            </form>    
        </div>

    );
  }
}