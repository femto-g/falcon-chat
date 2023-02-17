import React, {useState} from 'react';

export function AuthForm(props){

  return(

    <div className="AuthForm">
      <form>
        <h1>{props.signType}</h1>
        <input type="text" required></input>
        <input type="password" required></input>
        <input type="submit" value={props.signType}></input>
      </form>

    </div>

  )
}