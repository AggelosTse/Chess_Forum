import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export function LoginPage() {

    const {login} = useAuth();

    const [dataForm, setDataForm] = useState({
        "username": "",
        "password": ""
    })
    const [serverMessage, setServerMessage] = useState("");

    //formdata object changes dinamically
    const handleFormChange = (key, value) => {
        setDataForm((prev) => ({ ...prev, [key]: value }));
    };

    async function submitButton(e) {

        e.preventDefault(); //dont reload page when submit is clicked (since form is used)

        const response = await fetch('http://localhost:8001/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataForm)

        })

        const data = await response.json();
        setServerMessage(data.message);

        if(response.ok){
            login(data.token, data.role, data.username);
        }
    }

    return (
        <div>
            <Fields handleFormChange={handleFormChange} submitButton={submitButton} />
            <SignUpText />
            <ServerMessage serverMessage={serverMessage}/>
        </div>
    );
}

function Fields({ handleFormChange, submitButton }) {
    return (
        <form onSubmit={submitButton}>
            <input
                type="text"
                placeholder="Username"
                onChange={(e) => handleFormChange("username", e.target.value)}
            /><br />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => handleFormChange("password", e.target.value)}
            /><br />
            <button type="submit">Login</button>
        </form>
    );
}

//sign up button if user doesnt have an account
function SignUpText() {
  return (
    <div>
      <p>
          <span style={{ color: "gray", cursor: "not-allowed" }}>Dont have an account?</span>
          <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

function ServerMessage({serverMessage}){
    return <p>{serverMessage}</p>
}