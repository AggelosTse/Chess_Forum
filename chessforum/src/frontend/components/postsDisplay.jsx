import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Box, Typography, Button } from "@mui/material";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ArrowUpwardOutlined as ArrowUpwardIcon,
  ArrowDownwardOutlined as ArrowDownwardIcon,
} from "@mui/icons-material";

dayjs.extend(relativeTime); //to convert timestamp to relative time

export function PostsDisplay({ postsList, setPostsList, specificCommunity }) {
  const navig = useNavigate();

  const { token } = useAuth();

  async function updateVotes(value, post_id) {
    const voteType = value === 1 ? "upvoted" : "downvoted";

    const response = await fetch("http://localhost:8001/updatePostVotes", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vote: voteType,
        post_id: post_id,
      }),
    });
    const data = await response.json();

    if (response.ok) {
    
      if (setPostsList) {
        setPostsList((prevPosts) =>
          prevPosts.map((post) => {
            const currentId = post.id || post.post_id;
            if (currentId === post_id) {
              return {
                ...post,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
              };
            }
            return post;
          })
        );
      }
    }
  }

  return (
    <div>
      {specificCommunity && postsList.length > 0 && (
        <div>
          <p>{postsList[0].community_name}</p>
          <p>{dayjs(postsList[0].community_date_added).fromNow()}</p>
        </div>
      )}

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
        {Array.isArray(postsList) &&
          postsList.map((post) => {
            const post_id = post.id || post.post_id;

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
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.02)", //hover effect
                  },
                }}
              >
                <Box>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2">{post.description}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.85rem", mt: 0.5 }}
                  >
                    {post.userWhoPosted}
                  </Typography>
                </Box>

                {/*community button */}
                {!specificCommunity && (
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
                )}

                {/* Interaction Row: Votes & Comments */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* upvote button */}
                  <Button
                    size="small"
                    variant="text"
                    startIcon={
                      <ArrowUpwardIcon sx={{ fontSize: "1rem !important" }} />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      const value = 1;
                      updateVotes(value, post_id);
                    }}
                    sx={{
                      textTransform: "none",
                      padding: 0,
                      minWidth: "auto",
                      fontSize: "0.75rem",
                      color: "text.secondary",
                    }}
                  >
                    {post.upvotes > 0 &&
                      post.upvotes > post.downvotes &&
                      post.upvotes}
                  </Button>

                  {/* downvote button */}
                  <Button
                    size="small"
                    variant="text"
                    startIcon={
                      <ArrowDownwardIcon sx={{ fontSize: "1rem !important" }} />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      const value = -1;
                      updateVotes(value, post_id);
                    }}
                    sx={{
                      textTransform: "none",
                      padding: 0,
                      minWidth: "auto",
                      fontSize: "0.75rem",
                      color: "text.secondary",
                    }}
                  >
                    {post.downvotes > 0 &&
                      post.downvotes > post.upvotes &&
                      post.downvotes}
                  </Button>

                  {/* comments button */}
                  <Button
                    size="small"
                    variant="text"
                    startIcon={
                      <ChatBubbleOutlineIcon
                        sx={{ fontSize: "1rem !important" }}
                      />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      navig("/showSpecificPost", {
                        state: { post_id: post_id },
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

                  {dayjs(post.date_added).fromNow()}
                </Box>
              </Box>
            );
          })}
      </Box>
    </div>
  );
}
