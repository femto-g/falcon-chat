import React, {useState} from 'react';

export function AuthForm(props){

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [errorMessage, setErrorMessage] = useState();


  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  }
  
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = props.submitLogin(username, password);
    setErrorMessage(error);
  }

  return(

    <div className="AuthForm">

      <form action='submit' onSubmit={handleSubmit}>
        <h1>{props.signType}</h1>
        <h2>{errorMessage}</h2>
        <input id="username" type="text" value={username} onChange={onUsernameChange} required></input>
        <input id="password" type="password" value={password} onChange={onPasswordChange} required></input>
        <input type="submit" value={props.signType} ></input>
      </form>

    </div>

  )
}