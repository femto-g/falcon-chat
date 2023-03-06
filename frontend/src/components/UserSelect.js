import React from 'react';
import AsyncSelect from 'react-select/async';

export function UserSelect(props){

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
    console.log("reqeust done");
    const rows = await response.json();
    //const rows = JSON.parse(body);

    //const rows = JSON.parse(response.body);
    console.log(rows);
    console.log(typeof rows);
    const options = [];
    for(let row of rows){
      //console.log(row);
      options.push({value: row.username, label: row.username});
      //console.log(options);
    }
    console.log(options);
    return options;
  
    // .then(response => response.body)
    // .then(body => JSON.parse(body))
    // .then(rows => {
    //   console.log("hi");
    //   const options = {};
    //   for(let row in rows){
    //     options.value = row.username;
    //     options.label = row.username;
    //   }
    //   return options;
    // });


  }

  const handleChange = (e) => {
    console.log(`Search selected ${e.value}`);
    props.selectUser(e.value);
  }

  return(
    <div>
      <AsyncSelect
      isSearchable={true}
      loadOptions={getUsers}
      onChange={handleChange}
      defaultOptions={true}
      />
      
    </div>
  )
}