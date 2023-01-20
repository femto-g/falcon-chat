import React, { useContext, useState } from "react";

export function NicknameForm(props){

		//global nickname
		//const {nickName, setNickname} = useContext(NickNameContext);
		//state for form
		const [name, setName] = useState("");

		const handleSubmit = (e) => {
			e.preventDefault();
			props.onNicknameSubmit(name);
			setName("");
		}

		const handleNameChange = (e) => {
			setName(e.target.value);
		}


    return(
        <div className="NicknameForm">
					{props.prompt}
					<form action="submit" onSubmit={handleSubmit}>
						<input type="text" value={name} onChange={handleNameChange}></input>
						<input type="submit" value="submit"></input>
					</form>
        </div>

    )
}