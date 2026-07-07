import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useEffect, useState } from "react";

import { Box, Typography } from '@mui/material';


export function LandingPage() {

  const navig = useNavigate();

  const { token } = useAuth();

  return (
    <div>
      <LoginButton navigate={navig} />
      <SignupButton navigate={navig} />
      <CreateCommunity navigate={navig} token={token} />
      <FeedData navig={navig}/>
    </div>
  );
}




function LoginButton({ navigate }) {
  return <button onClick={() => navigate("/login")} >Login</button>
}

function SignupButton({ navigate }) {
  return <button onClick={() => navigate("/signup")} >Signup</button>
}

function CreateCommunity({ navigate, token }) {
  return token ? (< button onClick={() => navigate("/createCommunity")} >Create Community</button>) : null

}

function FeedData({navig}) {

  const [postsList, setPostsList] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {

    const response = await fetch('http://localhost:8001/getFeedData', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json();

    setPostsList(data);
  }

  //every container is a box with the post
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',   
      gap: 3,
      flexWrap: 'wrap',
      p: 2
    }}>
      {Object.keys(postsList).map((post_id) => {
        const post = postsList[post_id];

        return (
          <Box
            key={post_id}
            component="button"
            onClick={() => navig("/showSpecificPost", { state: { post_id: post_id } })}
            sx={{
              width: '300px',
              aspectRatio: '1 / 1', 
              border: '1px dashed grey',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="h6">{post.title}</Typography>
            <Typography variant="body2">{post.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              Community: {post.community_id}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}