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
	const [recieverId, setRecieverId] = useState(null);
  //console.log("rendering");

  
	useEffect(() => {
    setSocket(io('http://localhost:3001/'), { autoconnect: false });
    //console.log("connecting");
    return () => {
      if(socket){
        socket.close();
      }
    }
  }, []);

	useEffect(() => {
		if(socket){
			socket.on("connect_error", (err) => {
				console.log(`connect_error due to ${err.message}`);
			});
		}

	}, [socket]);

	const connectWithNickname = (name) => {
		//console.log(name);
		socket.auth = { name };
		socket.connect();
		setNickname(name);
		//console.log("setname");
	}

	const selectReciever = (name) => {
		socket.on("id_of_reciever", (id) => {
			console.log(id);
			setRecieverId(id);
		})

		socket.emit("selecting_reciever", name);
	}


	//render nickname form if nickname isn't yet set
	//else render message view
	if(nickname){
		if(recieverId){
			return (
				<div className="App">
					<SocketContext.Provider value={{socket}}>
						<MessageView reciever={recieverId}/>
					</SocketContext.Provider>
				</div>
			);
		}
		else{
			return (
				<div className="App">
					<NicknameForm prompt="Enter the user you would like to message (Must be online)" onNicknameSubmit={selectReciever} />
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
