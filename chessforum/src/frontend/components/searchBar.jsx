import { useState } from "react";

//handleformchange to send back the community id
export function SearchBar({ handleFormChange }) {

  const [searchTerm, setSearchTerm] = useState(""); //user input
  const [resultList, setResultList] = useState([]); //response from the server

  const [showDropdown, setShowDropdown] = useState(false);

  async function getSimilarResults(value) {
    const response = await fetch(
      `http://localhost:8001/getSimilarResults?searchterm=${value}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setResultList(data);
      setShowDropdown(true);
    }
  }

  function handleSelection(community) {
    //assign the title as the field's value
    setSearchTerm(community.title);
    setShowDropdown(false);

    //send the community id to the parent component ()
    handleFormChange("community_id", community.id);
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    getSimilarResults(value); //send in the fresh value instead of the state
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Community"
        value={searchTerm} //form is displaying the current tet user typed
        onChange={handleInputChange}
      />
      <br />

      {/* display the result list as a list */}
      {showDropdown && resultList.length > 0 && (
        <ul>
          {resultList.map((community) => (
            <li
              key={community.id}
              onClick={() => {
                //send the object that user picked
                handleSelection(community);
              }}
            >
              {community.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
