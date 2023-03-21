import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function AuthForm(props){

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  }
  
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await props.submitLogin(username, password);
    console.log(`authentication is ${success}`);
    //send text back eventually
    //setErrorMessage(error);
    //this happens even if request is good FIX THIS maybe just make this function async and await login?
    if(success){
      navigate("/dashboard");
    }
    else{
      setErrorMessage(`${props.signType} failed, try again`);
    }
  }

  const obj = {
    "signup" : "Don't have an account? Sign up!",
    "login" : "Already have an account? Log in!"
  }

  const oppositeSignType = props.signType === "login" ? "signup" : "login";

  const authLinkMessage = obj[oppositeSignType];
  //console.log(authLinkMessage);

  return(

    <div className="AuthForm">
      <h1>{props.signType}</h1>
      <h2>{errorMessage}</h2>
      <form action='submit' onSubmit={handleSubmit}>
        <input id="username" type="text" value={username} onChange={onUsernameChange} required></input>
        <input id="password" type="password" value={password} onChange={onPasswordChange} required></input>
        <input type="submit" value={props.signType} ></input>
      </form>
      <h2>
        <Link to={`/${oppositeSignType}`}>{authLinkMessage}</Link>
      </h2>

    </div>

  )
}