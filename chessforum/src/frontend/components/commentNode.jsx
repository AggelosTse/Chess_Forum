import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import {
  ArrowUpwardOutlined as ArrowUpwardIcon,
  ArrowDownwardOutlined as ArrowDownwardIcon,
} from "@mui/icons-material";

export function CommentNode({ post_id, comment, setCommentTrigger, setCommentsList }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { token } = useAuth();

  //helper to update comments after votes are added
  function updateCommentInTree(comments, targetId, newUpvotes, newDownvotes) {
    return comments.map((c) => {
      if (c.id === targetId) {
        return {
          ...c,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
        };
      }
      if (c.children && c.children.length > 0) {
        return {
          ...c,
          children: updateCommentInTree(c.children, targetId, newUpvotes, newDownvotes),
        };
      }
      return c;
    });
  }

  async function updateVotes(value, comment_id) {

    const voteType = value === 1 ? "upvoted" : "downvoted";

    const response = await fetch("http://localhost:8001/updateCommentVotes", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        "vote": voteType,
        "comment_id": comment_id,
      }),
    });
    const data = await response.json();
    
    if (response.ok && data.upvotes !== undefined) {
      if (setCommentsList) {
        setCommentsList((prevComments) =>
          updateCommentInTree(prevComments, comment_id, data.upvotes, data.downvotes)
        );
      }
    }
  }


  async function handleReplySubmit(e) {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      const response = await fetch("http://localhost:8001/createComment", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: post_id,
          commentText: replyText,
          parent_id: comment.id,
          addedFromField: false, //since its a reply, addedFromField is false
        }),
      });

      if (response.ok) {
        setReplyText("");
        setIsReplying(false);

        if (setCommentTrigger) {
          setCommentTrigger((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  }

  return (
    <Box
      sx={{
        pl: comment.parent_id ? 3 : 0,
        mt: 2,
        borderLeft: comment.parent_id ? "2px solid #e0e0e0" : "none",
      }}
    >
      <Box sx={{ p: 1.5, bgcolor: "#f9f9f9", borderRadius: "4px" }}>
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          {comment.username || "Anonymous"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {comment.text}
        </Typography>

        {token && (
          <Button
            size="small"
            onClick={() => setIsReplying(!isReplying)}
            sx={{
              mt: 1,
              textTransform: "none",
              padding: "2px 4px",
              minWidth: "auto",
            }}
          >
            {isReplying ? "Cancel" : "Reply"}
          </Button>
        )}
        {/* upvote button */}
        <Button
          size="small"
          variant="text"
          startIcon={<ArrowUpwardIcon sx={{ fontSize: "1rem !important" }} />}
          onClick={(e) => {
            e.stopPropagation();
            const value = 1;
            updateVotes(value, comment.id);
          }}
          sx={{
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {comment.upvotes}
        </Button>

        {/* downvote button */}
        <Button
          size="small"
          variant="text"
          startIcon={<ArrowDownwardIcon sx={{ fontSize: "1rem !important" }} />}
          onClick={(e) => {
            e.stopPropagation();
            const value = -1;
            updateVotes(value, comment.id);
          }}
          sx={{
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {comment.downvotes}
        </Button>
      </Box>

      {isReplying && (
        <Box
          component="form"
          onSubmit={handleReplySubmit}
          sx={{ mt: 1, ml: 2, display: "flex", gap: 1 }}
        >
          <input
            type="text"
            placeholder={`Reply to ${comment.username || "user"}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            Submit
          </button>
        </Box>
      )}

      {comment.children && comment.children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {comment.children.map((childComment) => (
            //calls comment node recursively
            <CommentNode
              key={childComment.id}
              post_id={post_id}
              comment={childComment}
              setCommentTrigger={setCommentTrigger}
              setCommentsList={setCommentsList}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
