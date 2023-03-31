import React, { useEffect, useState } from 'react';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';

import { MessageView } from '../MessageView/MessageView';
import { UserSelect } from '../UserSelect/UserSelect';
import './styles.css';


export function Dashboard(props){

  // const session = useLoaderData();
  // console.log(session);
  // if(!session){
  //   redirect('/login');
  // }

  const [username, setUsername] = useState(null);

  const navigate = useNavigate();
  const appName = "Chat";

  useEffect(() => {

    const checkSession = async () => {
      const response = await props.getSession();

      if(!response.ok){
        navigate("/login");
        navigate(0);
      }
      else{
        const user = await response.json();
        console.log(`logged in as ${user.username}`);
        setUsername(user.username);
      }
    }
    checkSession();

  },[]);

  // if(!props.authStatus){
  //   return navigate("/login");
  // }

  const handleSelect = (user) =>{
    props.selectReceiver(user);
  }

  const logout = async () =>{
    const responseOK = await props.logout();
    if(responseOK){
      navigate("/");
      navigate(0);
    }

  }

  return(
    <div className='dashboard'>
      <header className='dashboard-header'>{appName}
        <button className='logout-button' onClick={logout}>Log out</button>
        <h3 className='username-heading'>{username}</h3>
      </header>
      <div className='dashboard-content'>
        <UserSelect selectUser={handleSelect} username={username} receiver={props.receiverId}/>
        <MessageView receiver={props.receiverId} username={username}/>
      </div>
    </div>
  )
}