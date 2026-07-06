import { useState } from "react";

export function CreateCommunity(){

    const [dataForm, setDataForm] = useState({
            "title": "",
            "description": ""
        })

    const [serverMessage, setServerMessage] = useState("");

    //formdata object changes dinamically
    const handleFormChange = (key, value) => {
        setDataForm((prev) => ({ ...prev, [key]: value }));
    };

    async function submitButton(e){

        e.preventDefault(); //dont reload page when submit is clicked (since form is used)

        const response = await fetch('http://localhost:8001/createCommunity', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataForm)

        })
        const data = await response.json();
        setServerMessage(data.message);

    }

    return (
        <form onSubmit={submitButton}>
            <input
                type="text"
                placeholder="Title"
                onChange={(e) => handleFormChange("title", e.target.value)}
            /><br />
            <input
                type="text"
                placeholder="Description"
                onChange={(e) => handleFormChange("description", e.target.value)}
            /><br />
            <button type="submit">Create Community</button>
        </form>
    );  
} 

function ServerMessage({serverMessage}){
    return <p>{serverMessage}</p>
}