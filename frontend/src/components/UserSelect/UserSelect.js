import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { UserButton } from '../UserButton/UserButton';
import { UserButtonContainer } from '../UserButtonContainer/UserButtonContainer';
import './styles.css';

export function UserSelect(props){

  const [button, setButton] = useState(<p>{"hi"}</p>);
  const [users, setUsers] = useState([]);
  const [userList, setUserList] = useState([]);


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

  const handleChange = (e) => {
    //console.log(`Search selected ${e.value}`);
    const selectedUser = e.value;
    if(!users.includes(selectedUser)){
      setUsers([selectedUser, ...users]);
    }
    console.log(users);
    props.selectUser(selectedUser);

  }

  const handleUserButtonClick = (user) => {
    props.selectUser(user);

  }

  useEffect(() => {
    setUserList(
      users.map((user) => <UserButton val={user} handleUserButtonClick={handleUserButtonClick}/>)
        //<p>{user}</p>
    )
    //console.log(userList);
  }, [users])

  const styles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: "100%"
    })
  };
  

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