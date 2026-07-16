import { useEffect, useState } from "react";
import { PostsDisplay } from "../components/postsDisplay.jsx";

export function LandingPage() {
  const [postsList, setPostsList] = useState({});

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch("http://localhost:8001/getPostsData", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setPostsList(data);
    }
    fetchPosts();
  }, []);

  return <PostsDisplay postsList={postsList} specificCommunity={false} />;
}
