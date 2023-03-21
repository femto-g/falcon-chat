import React from "react";
import { Link } from "react-router-dom";

export function Root(){

  return(

    <div>
      <h1>CHAT</h1>
      <Link to={'login'}>Login</Link>
      <Link to={'signup'}>Sign up</Link>
    </div>


  )
}