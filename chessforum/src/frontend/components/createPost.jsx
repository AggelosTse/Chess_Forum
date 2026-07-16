import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLocation } from "react-router-dom";

export function CreatePost() {

  const {token} = useAuth();

  const location = useLocation();

  //bool if user is posting in a specific community 
  const specificCommunity = location.state?.specificCommunity;

  //always send community_id, if not in specific community, it will be initialized as null
  const community_id = location.state?.community_id;
  console.log(community_id);
  const [dataForm, setDataForm] = useState({
    title: "",
    description: "",
    community_id: community_id,
  });

  async function submitButton(e) {
    setServerMessage("");

    e.preventDefault(); //dont reload page when submit is clicked (since form is used)

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
        //render community selection component if not in specific community
        <CommunitySelection handleFormChange={handleFormChange} />
      )}

      <Fields submitButton={submitButton} handleFormChange={handleFormChange} />
    </div>
  );
}

function CommunitySelection({ handleFormChange }) {
  //handleFormChange("community_id", e.target.value);
}

function Fields({ submitButton, handleFormChange }) {
  return (
    <form onSubmit={submitButton}>
      <input
        type="text"
        placeholder="Title"
        onChange={(e) => handleFormChange("title", e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Description"
        onChange={(e) => handleFormChange("description", e.target.value)}
      />
      <br />
      <button type="submit">Create Post</button>
    </form>
  );
}
