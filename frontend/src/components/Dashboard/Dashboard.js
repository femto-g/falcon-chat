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

  return(
    <div className='dashboard'>
      <UserSelect selectUser={handleSelect}/>
      <MessageView receiver={props.receiverId} username={username}/>
    </div>
  )
}