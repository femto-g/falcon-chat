import './App.css';
import { io } from "socket.io-client";
import {useEffect, useState} from 'react';
import { SocketContext } from './contexts/SocketContext';
import { MessageView } from './components/MessageView';
import { NicknameForm } from './components/NicknameForm';

function App() {
  
  const [socket, setSocket] = useState(null);
  const [nickname, setNickname] = useState(null);
	//nickname of user to that will be sent messages
	const [receiverId, setReceiverId] = useState(null);
  
	useEffect(() => {
		setSocket(io('http://localhost:3001/',
		 { autoConnect: false,
			 withCredentials: true
		 }));
    //console.log("connecting");
    return () => {
      if(socket){
        socket.close();
      }
    }
  }, []);

	//make dummy request on startup to check if session exists
	useEffect(() => {
		if(socket){
			socket.on("connect_error", (err) => {
				console.log(`connect_error due to ${err.message}`);
			});
			fetch('http://localhost:3001/session', {
				method: 'GET',
				mode: 'cors',
				credentials: 'include'
			})
			.then(response => response.text())
			.then(name => {
				console.log(`name from response is ${name}`);
				if(name && name.length != 0){
					console.log("something");
					connectWithNickname(name);
				}
			});

		}

	}, [socket]);

	//causes bug because socket isn't set when socket.auth is accessed.
	const connectWithNickname = (name) => {
		console.log(`connecting with ${name} `);
		//console.log(name);
		socket.auth = { name };
		socket.connect();
		setNickname(name);
		//console.log("setname");
	}

	const selectReceiver = (name) => {
		socket.on("id_of_receiver", (id) => {
			console.log(`got receiver id of ${id}, for user: ${name}`);
			setReceiverId(id);
		})

		socket.emit("selecting_receiver", name);
	}


	//render nickname form if nickname isn't yet set
	//else render message view
	if(nickname){
		if(receiverId){
			return (
				<div className="App">
					<SocketContext.Provider value={{socket}}>
						<MessageView name={nickname} receiver={receiverId} />
					</SocketContext.Provider>
				</div>
			);
		}
		else{
			return (
				<div className="App">
					<NicknameForm prompt={"Hello " + nickname + ", Enter the user you would like to message (Must be online)"} onNicknameSubmit={selectReceiver} />
				</div>
			)
			
		}

	}
	else{
		return ( 
			<div className='App'>
				<NicknameForm prompt="Enter your nickname" onNicknameSubmit={connectWithNickname} />
			</div>
		)
	}

}

export default App;
