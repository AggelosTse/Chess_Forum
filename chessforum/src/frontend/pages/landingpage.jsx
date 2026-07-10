import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon } from "@mui/icons-material";

export function LandingPage() {
  const navig = useNavigate();

  const { token } = useAuth();

  return (
    <div>
      <LoginButton navigate={navig} />
      <SignupButton navigate={navig} />
      <CreateCommunity navigate={navig} token={token} />
      <DisplayPosts navig={navig} />
    </div>
  );
}

function LoginButton({ navigate }) {
  return <button onClick={() => navigate("/login")}>Login</button>;
}

function SignupButton({ navigate }) {
  return <button onClick={() => navigate("/signup")}>Signup</button>;
}

function CreateCommunity({ navigate, token }) {
  return token ? (
    <button onClick={() => navigate("/createCommunity")}>
      Create Community
    </button>
  ) : null;
}

//posts from all communities
function DisplayPosts({ navig }) {
  const [postsList, setPostsList] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        flexWrap: "wrap",
        p: 2,
      }}
    >
      {Object.keys(postsList).map((post_id) => {
        const post = postsList[post_id];

        return (
          <Box
            key={post_id}
            component="div"
            onClick={() =>
              navig("/showSpecificPost", { state: { post_id: post_id } })
            }
            sx={{
              width: "300px",
              aspectRatio: "1 / 1",
              border: "1px dashed grey",
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              cursor: "pointer", // make whole box look clickable
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.02)", //hover effect
              },
            }}
          >
            <Typography variant="h6">{post.title}</Typography>
            <Typography variant="body2">{post.description}</Typography>
            <Typography variant="body2">{post.userWhoPosted}</Typography>

            {/*community button */}
            <Button
              size="small"
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                navig("/showSpecificCommunity", {
                  state: { community_id: post.community_id },
                });
              }}
              sx={{
                textTransform: "none",
                padding: 0,
                minWidth: "auto",
                alignSelf: "flex-start",
                fontSize: "0.75rem",
                color: "text.secondary",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Community: {post.community_name}
            </Button>

            {/* comments button */}
            <Button
              size="small"
              variant="text"
              startIcon={
                <ChatBubbleOutlineIcon sx={{ fontSize: "1rem !important" }} />
              } 
              onClick={(e) => {
                e.stopPropagation();
                navig("/showSpecificPost", {
                  state: { post_id: post_id},
                });
              }}
              sx={{
                textTransform: "none",
                padding: 0,
                minWidth: "auto",
                fontSize: "0.75rem",
                color: "text.secondary",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
             Comments   
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
