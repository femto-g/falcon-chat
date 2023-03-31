import React from "react";
import './styles.css';

export function UserButton(props){

  const onUserButtonClick = () => {
    props.handleUserButtonClick(props.val);
      
  }

  return (
      <button className="UserButton" onClick={onUserButtonClick}>{props.val} Unread: {props.unread}</button>

  )
}