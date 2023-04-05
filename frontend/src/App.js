import './App.css';
import { io } from "socket.io-client";
import {useEffect, useState} from 'react';
import { SocketContext } from './contexts/SocketContext';
import { AuthForm } from './components/AuthForm/AuthForm';
import {createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Routes, redirect, useNavigate} from 'react-router-dom';
//import { UserSelect } from './components/UserSelect';
import { ErrorPage } from './components/ErrorPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Root } from './components/Root/Root';

function App() {
  
  const [socket, setSocket] = useState(io(`${process.env.REACT_APP_SERVER_URL}/`,
	{ autoConnect: false,
		withCredentials: true
	}));

	const [username, setUsername] = useState(null);

	//nickname of user to that will be sent messages
	const [receiverId, setReceiverId] = useState(null);

	const [authStatus, setAuthStatus] = useState(false);
	const [authError, setAuthError] = useState("");

	
	useEffect(() => {
    return () => {
      if(socket){
        socket.close();
      }
    }
  }, []);

	//maybe turn this into react-query query
	const getSession = async () => {
		const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/session`, {
				method: 'GET',
				mode: 'cors',
				credentials: 'include'
			});

		if(response.ok){
				setAuthStatus(true);
				socket.connect();
		}	

		//const user = await response.json()
		//setUsername(user.username);
		return response;
	}

	useEffect(() => {
		if(socket){
			socket.on("connect_error", (err) => {
				console.log(`connect_error due to ${err.message}`);
			});
			//getSession();
			
		}

	}, [socket]);


	//login function
	const login = async (username, password) => {
		const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/login`, {
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
		const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/signup`, {
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

	const logout = async () => {
		const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/logout`, {
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
		});
		if(response.ok){
			socket.close();
			setAuthError(false);
		}

		return response.ok;
	}

	const selectReceiver = (name) => {
		setReceiverId(name);
	}


	
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Root />,
			errorElement: <ErrorPage />
		},
		{
			path: "login",
			element: <AuthForm signType="login" submitLogin={login}/>
		},
		{
			path: "signup",
			element: <AuthForm signType="signup" submitLogin={signup}/>
		},
		{
			path: "dashboard",
			element: <SocketContext.Provider value={{socket}}>
				<Dashboard receiverId={receiverId} getSession={getSession} selectReceiver={selectReceiver} logout={logout}/>
				</SocketContext.Provider>
			//loader: noSessionRedirect
		}

	]);
	

	return(

		<RouterProvider router={router} />
	)

}

export default App;
