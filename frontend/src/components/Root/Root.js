import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

export function Root(){

  return(

    <div className="root-route">
      <h1 className="appname-heading">FalconChat</h1>
      <Link className="root-link text-center rounded-lg border hover:border-blue-500" to={'login'}>Login</Link>
      <Link className=" root-link text-center rounded-lg border  hover:border-blue-500" to={'signup'}>Sign up</Link>
    </div>


  )
}