import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

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
  
    if(success){
      navigate("/dashboard");
    }
    else{
      setErrorMessage(`${props.signType} failed, try again`);
    }
  }

  const authLinkobj = {
    "signup" : "Don't have an account? Sign up!",
    "login" : "Already have an account? Log in!"
  }

  const headingMessage = {
    "signup" : "Sign up",
    "login" : "Log in"
  }

  const oppositeSignType = props.signType === "login" ? "signup" : "login";

  const authLinkMessage = authLinkobj[oppositeSignType];

  return(

    <div className="AuthForm">
      <h1 className="appname-heading">FalconChat</h1>
      <h2 className="auth-heading">{headingMessage[props.signType]}</h2>
      <h3>{errorMessage}</h3>
      <form className="form rounded-md border" action='submit' onSubmit={handleSubmit}>
        <label htmlFor='username'>Username</label>
        <input className="text-center rounded-md border" id="username" type="text" value={username} onChange={onUsernameChange} required></input>
        <label htmlFor='password'>Password</label>
        <input className="text-center rounded-md border"id="password" type="password" value={password} onChange={onPasswordChange} required></input>
        <input className="submit text-center rounded-md border border-zinc-700" type="submit" value={props.signType} ></input>
      </form>
      <h3 className="auth-link-message border rounded-md">
        <Link className="link" to={`/${oppositeSignType}`}>{authLinkMessage}</Link>
      </h3>

    </div>

  )
}