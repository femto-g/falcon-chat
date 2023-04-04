import React from "react";
import './styles.css';

export function UserButton(props){

  const onUserButtonClick = () => {
    props.handleUserButtonClick(props.val);
      
  }

  return (
      <button className="UserButton border" onClick={onUserButtonClick}>{props.val} <div className="unread-notif rounded-full" style={props.unread > 0 ? {} : {display: 'none'}} >{props.unread > 0 ? props.unread : ''}</div></button>

  )
}