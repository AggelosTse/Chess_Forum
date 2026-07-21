import { useNavigate } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";

import {
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ArrowUpwardOutlined as ArrowUpwardIcon,
  ArrowDownwardOutlined as ArrowDownwardIcon,
} from "@mui/icons-material";

export function PostsDisplay({ postsList, specificCommunity }) {
  const navig = useNavigate();

  async function updateVotes(value, post_id) {
    const response = null;

    switch (value) {
      case 1:
        response = await fetch("http://localhost:8001/updatePostVotes", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "upvoted": true,
            "post_id": post_id,
          }),
        });
      case -1:
        response = await fetch("http://localhost:8001/updatePostVotes", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "upvoted": false,
            "post_id": post_id
          }),
        });
    }
  }

  return (
    <div>
      {specificCommunity && Object.keys(postsList).length > 0 && (
        <p>{postsList[Object.keys(postsList)[0]].community_name}</p>
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
              </Box>
            </Box>
          );
        })}
      </Box>
    </div>
  );
}
