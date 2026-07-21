import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { PostsDisplay } from "../components/postsDisplay.jsx";

export function ShowCommunity() {
  const [postsList, setPostsList] = useState({});

  const navig = useNavigate();

  const location = useLocation();
  const community_id = location.state?.community_id;

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch(
        `http://localhost:8001/getSpecificCommunityPosts?community_id=${community_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      setPostsList(data);
    }
    fetchPosts();
  }, [community_id]);

  return (
    <div>
      <button
        onClick={() =>
          navig("/createPost", {
            state: {
              specificCommunity: true,
              community_id: community_id,
            },
          })
        }
      >
        create post
      </button>
      <PostsDisplay postsList={postsList} specificCommunity={true} />
    </div>
  );
}
