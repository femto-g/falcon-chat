import React, { useEffect, useState } from 'react';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';

import { MessageView } from '../MessageView/MessageView';
import { UserSelect } from '../UserSelect/UserSelect';
import './styles.css';


export function Dashboard(props){

  const [username, setUsername] = useState(null);
  const [messageViewActive, setMessageViewActive] = useState(false);
  const navigate = useNavigate();
  const appName = "FalconChat";
  const mediaQueryList = window.matchMedia("only screen and (max-width: 700px)");

  useEffect(() => {

    const checkSession = async () => {
      const response = await props.getSession();

      if(!response.ok){
        navigate("/login");
        navigate(0);
      }
      else{
        const user = await response.json();
        setUsername(user.username);
      }
    }
    checkSession();

  },[]);

  const switchToUserSelect = () => {
    setMessageViewActive(false);
  }

  const switchToMessageView = () => {
    setMessageViewActive(true);
  }


  const handleSelect = (user) =>{
    props.selectReceiver(user);
    //should switch to message view on mobile
    if(mediaQueryList.matches){
      switchToMessageView();
    }

  }

  const logout = async () =>{
    const responseOK = await props.logout();
    if(responseOK){
      navigate("/");
      navigate(0);
    }

  }

  if(!username){
    return <div></div>
  }

  else{




  return(
    <div className='dashboard'>
      <header className='dashboard-header '>
        <h3 className='appname-heading'>{appName}</h3>
        <h3 className='username-heading'>{username}</h3>
        <button className='logout-button border rounded-md' onClick={logout}>Log out</button>
      </header>
      <div className='dashboard-content'>
        <UserSelect selectUser={handleSelect} username={username} receiver={props.receiverId} active={!messageViewActive}/>
        <MessageView receiver={props.receiverId} username={username} active={messageViewActive} switchToUserSelect={switchToUserSelect}/>
      </div>
    </div>
  )
  }
}