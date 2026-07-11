import { useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export function SignupPage() {
  const { login } = useAuth();

  const [dataForm, setDataForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [serverMessage, setServerMessage] = useState("");

  const navig = useNavigate();

  //formdata object changes dinamically
  const handleFormChange = (key, value) => {
    setDataForm((prev) => ({ ...prev, [key]: value }));
  };

  async function submitButton(e) {
    e.preventDefault(); //dont reload page when submit is clicked (since form is used)

    const response = await fetch("http://localhost:8001/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    });
    const data = await response.json();
    setServerMessage(data.message);
    if (response.ok) {
      login(data.token, data.role, data.username);
      setTimeout(() => {
        navig("/");
      }, 800);
    }
  }

  return (
    <div>
      <Fields handleFormChange={handleFormChange} submitButton={submitButton} />
      <ServerMessage serverMessage={serverMessage} />
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
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => handleFormChange("password", e.target.value)}
      />
      <br />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => handleFormChange("email", e.target.value)}
      />
      <br />

      <button type="submit">Sign Up</button>
    </form>
  );
}

function ServerMessage({ serverMessage }) {
  return <p> {serverMessage} </p>;
}
