import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { UserButton } from '../UserButton/UserButton';
import { UserButtonContainer } from '../UserButtonContainer/UserButtonContainer';
import './styles.css';

export function UserSelect(props){

  const [button, setButton] = useState(<p>{"hi"}</p>);
  const [users, setUsers] = useState([]);
  const [userList, setUserList] = useState([]);

  const queryClient = useQueryClient();


  //gets users from server based on search query
  const getUsers = async (e) => {
    console.log(e);
    const searchQuery = e;
    const response = await fetch('http://localhost:3001/search', {
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
    //console.log(`Search selected ${e.value}`);
    const selectedUser = e.value;
    if(!users.includes(selectedUser)){
      setUsers([selectedUser, ...users]);
      setUserList([<UserButton val={selectedUser} key={selectedUser} handleUserButtonClick={handleUserButtonClick}/>, ...userList]);
    }
    console.log(users);
    props.selectUser(selectedUser);

    



    //USE REACT QUERY MUTATION HERE INSTEAD?

  }

  const handleUserButtonClick = (user) => {
    props.selectUser(user);
    //change color here too
    console.log(`mutating ${user}`);
    readMessageMutation.mutate(user);
  }

  
  // useEffect(() => {
  //   setUserList(
  //     users.map((user) => <UserButton val={user} handleUserButtonClick={handleUserButtonClick}/>)
  //       //<p>{user}</p>
  //   )
  //   //console.log(userList);
  // }, [users])

  const styles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: "100%"
    })
  };

  const userListQuery = useQuery({
    queryKey: ["userList", props.username],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/active-chats', {
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
        data.map((row) => <UserButton val={row.conversation} key={row.conversation} handleUserButtonClick={handleUserButtonClick} unread={row.unread} />)
      );
      setUsers(
        data.map((row) => row.conversation)
      );
    },
    staleTime: 1000 * 60 * 10000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  if(userListQuery.isLoading){
    console.log("Userlist loading...");

  };

  if(userListQuery.isError){
    console.log(userListQuery.error);

  };

  const readMessageMutation = useMutation({
    mutationFn: async (sender) => {
      const response = await fetch('http://localhost:3001/read-messages', {
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
      console.log(`invalidating queries for ${props.username}`);
      queryClient.invalidateQueries({queryKey: ["userList", props.username]});
    }
  });

  

  

  return(
    <div className='UserSelect'>
      <AsyncSelect
      isSearchable={true}
      loadOptions={getUsers}
      onChange={handleChange}
      defaultOptions={true}
      cacheOptions={true}
      className={"async-select"}
      //classNames={{control: (state) => "async-select-control"}}
      styles={styles}
      />
      <UserButtonContainer>
        {userList}
      </UserButtonContainer>
      
    </div>
  )
}