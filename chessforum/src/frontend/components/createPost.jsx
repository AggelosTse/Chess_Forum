import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLocation } from "react-router-dom";

import Swal from "sweetalert2";

import { SearchBar } from "./searchBar.jsx";

export function CreatePost() {
  const { token } = useAuth();

  const location = useLocation();

  const [serverMessage, setServerMessage] = useState("");

  //bool if user is posting in a specific community
  const specificCommunity = location.state?.specificCommunity;

  //always send community_id, if not in specific community, it will be initialized as null
  const community_id = location.state?.community_id;

  const [dataForm, setDataForm] = useState({
    title: "",
    description: "",
    community_id: community_id
  });

  async function submitButton(e) {
    e.preventDefault(); //dont reload page when submit is clicked (since form is used)

    setServerMessage("");

    const response = await fetch("http://localhost:8001/createPost", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataForm),
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "Success!",
        text: `${data.message}`,
        icon: "success",
        confirmButtonText: "Awesome",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          setDataForm({
            community_id : dataForm.community_id,    //keeping the community_id even if making the object null
            title: "",
            description: "",
          });
        }
      });
    } else {
      setServerMessage(data.message);
    }
  }

  const handleFormChange = (key, value) => {
    setDataForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {!specificCommunity && (
        //render search bar component if not in specific community
        <SearchBar handleFormChange={handleFormChange} />
      )}

      <Fields submitButton={submitButton} handleFormChange={handleFormChange} dataForm={dataForm} />

      <ServerMessage serverMessage={serverMessage} />
    </div>
  );
}

function Fields({ submitButton, handleFormChange, dataForm }) {
  return (
    <form onSubmit={submitButton}>
      <input
        type="text"
        placeholder="Title"
        value={dataForm.title}
        onChange={(e) => handleFormChange("title", e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Description"
        value={dataForm.description}
        onChange={(e) => handleFormChange("description", e.target.value)}
      />
      <br />
      <button type="submit">Create Post</button>
    </form>
  );
}

function ServerMessage({ serverMessage }) {
  return <p>{serverMessage}</p>;
}
