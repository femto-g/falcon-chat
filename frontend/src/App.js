import './App.css';
import { io } from "socket.io-client";
import {useEffect, useState} from 'react';
import { SocketContext } from './contexts/SocketContext';
import { MessageView } from './components/MessageView';
import { NicknameForm } from './components/NicknameForm';
import { AuthForm } from './components/AuthForm';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { UserSelect } from './components/UserSelect';


function App() {
  
  const [socket, setSocket] = useState(null);
  const [nickname, setNickname] = useState(null);

	//nickname of user to that will be sent messages
	const [receiverId, setReceiverId] = useState(null);

	const [authStatus, setAuthStatus] = useState(false);
	const [authError, setAuthError] = useState("");
  
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
			.then(response => response.ok)
			.then(okay => {
				if(okay){
					setAuthStatus(true);
					socket.connect();
				}
			});
		}

	}, [socket]);

	//causes bug because socket isn't set when socket.auth is accessed.
	//once auth is set up you can just connect without socket.auth
	// const connectWithNickname = (name) => {
	// 	console.log(`connecting with ${name} `);
	// 	//console.log(name);
	// 	socket.auth = { name };
	// 	socket.connect();
	// 	setNickname(name);
	// 	//console.log("setname");
	// }

	//login function
	const login = async (username, password) => {
		const response = await fetch('http://localhost:3001/login', {
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			body: JSON.stringify({username: username, password: password}),
			headers: {"content-type" : "application/json"}
		})
		if(response.ok){
			socket.connect();
			setAuthStatus(true);
		}
		// else{
		// 	setAuthError("Log in failed. Try again");
		// }

		return response.ok;

	}

	//signup function
	const signup = async (username, password) => {
		const response = await fetch('http://localhost:3001/signup', {
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			body: JSON.stringify({username: username, password: password}),
			headers: {"content-type" : "application/json"}
		})
		if(response.ok){
			socket.connect();
			setAuthStatus(true);
		}
		// else{
		// 	setAuthError("Sign up failed. Try again");
		// }

		return response.ok;

	}

	const selectReceiver = (name) => {
		// socket.on("id_of_receiver", (id) => {
		// 	console.log(`got receiver id of ${id}, for user: ${name}`);
		// 	setReceiverId(id);
		// })

		// socket.emit("selecting_receiver", name);
		setReceiverId(name);
	}

	
	// const router = createBrowserRouter([
  
	// ])
	

	//render nickname form if nickname isn't yet set
	//else render message view
	if(authStatus){
		if(receiverId){
			return (
				<div className="App">
					<SocketContext.Provider value={{socket}}>
						<MessageView name="placeholder" receiver={receiverId} />
					</SocketContext.Provider>
				</div>
			);
		}
		else{
			return (
				<div className="App">
					{/* <NicknameForm prompt={"Hello " + nickname + ", Enter the user you would like to message (Must be online)"} onNicknameSubmit={selectReceiver} /> */}
					<UserSelect selectUser={selectReceiver} />
				</div>
			)
			
		}

	}
	else{
		return ( 
			<div className='App'>
				{/* <NicknameForm prompt="Enter your nickname" onNicknameSubmit={connectWithNickname} /> */}
				<AuthForm signType="Sign up" submitLogin={signup} />
			</div>
		)
	}

}

export default App;
