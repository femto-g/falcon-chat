import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { UserButton } from '../UserButton/UserButton';
import { UserButtonContainer } from '../UserButtonContainer/UserButtonContainer';
import './styles.css';
import { SocketContext } from '../../contexts/SocketContext';

export function UserSelect(props){

  const [button, setButton] = useState(<p>{"hi"}</p>);
  const [users, setUsers] = useState([]);
  const [userList, setUserList] = useState([]);

  const queryClient = useQueryClient();


  //gets users from server based on search query
  const getUsers = async (e) => {
    const searchQuery = e;
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/search`, {
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			body: JSON.stringify({searchQuery: searchQuery}),
			headers: {"content-type" : "application/json"}
		});
    const rows = await response.json();
    const options = [];
    for(let row of rows){
      options.push({value: row.username, label: row.username});
    }
    
    return options;
  }

  //when option is selected from select drop-down
  const handleChange = (e) => {
    const selectedUser = e.value;
    if(!users.includes(selectedUser)){
      setUsers([selectedUser, ...users]);
      setUserList([<UserButton val={selectedUser} key={selectedUser} handleUserButtonClick={handleUserButtonClick}/>, ...userList]);
    }
    props.selectUser(selectedUser);

    



    //USE REACT QUERY MUTATION HERE INSTEAD?

  }

  const handleUserButtonClick = (user) => {
    props.selectUser(user);
    readMessageMutation.mutate(user);
  }

  const styles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: "100%",
      overflow: 'hidden',
      'overflow-wrap': 'normal'
    })
  };

  const userListQuery = useQuery({
    queryKey: ["userList", props.username],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/active-chats`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({username: props.username}),
        headers: {"content-type" : "application/json"}
		  });
      if(!response.ok){
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setUserList(
        data.map((row) => <UserButton val={row.conversation} key={row.conversation}
                           handleUserButtonClick={handleUserButtonClick} unread={row.unread}
                           active={row.conversation === props.receiver} />)
      );
      setUsers(
        data.map((row) => row.conversation)
      );
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  if(userListQuery.isLoading){
    //do something
  };

  if(userListQuery.isError){
    //do something

  };

  const readMessageMutation = useMutation({
    mutationFn: async (sender) => {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/read-messages`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({sender: sender, receiver: props.username}),
        headers: {"content-type" : "application/json"}
		  });
      if(!response.ok){
        throw new Error('Network response was not ok');
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ["userList", props.username]});
    }
  });

  const [listenerRef, setListenerRef] = useState();
  const { socket } = useContext(SocketContext);
  useEffect(() => {

    if(listenerRef && socket){
      socket.off('private message', listenerRef);
    }
    const receivedMessageFromActiveListener = (msg) => {
      if(msg.sender === props.receiver){
        readMessageMutation.mutate(msg.sender);

      }
    }; 
    setListenerRef(() => receivedMessageFromActiveListener);

    if(socket){
        socket.on('private message', receivedMessageFromActiveListener);
    }
		//cleanup
    return () => {
      socket.off('private message', receivedMessageFromActiveListener);
    }
  }, [props.receiver]);
  

  return(
    <div className={'UserSelect ' + (props.active ? 'active' : 'inactive')}>
      <AsyncSelect
      isSearchable={true}
      loadOptions={getUsers}
      onChange={handleChange}
      defaultOptions={true}
      cacheOptions={true}
      className={"async-select"}
      //classNames={{control: (state) => "async-select-control"}}
      styles={styles}
      controlShouldRenderValue={false}
      placeholder={"Find or start a chat"}
      noOptionsMessage={() => "Can't find user"}
      />
      <UserButtonContainer>
        {userList}
      </UserButtonContainer>
      
    </div>
  )
}