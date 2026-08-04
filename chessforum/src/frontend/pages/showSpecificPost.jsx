import { Box, Typography, Button } from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

import { CommentNode } from "../components/commentNode.jsx";
import { buildCommentTree } from "../../utils/commentHelper.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  ChatBubbleOutlineOutlined as ChatBubbleOutlineIcon,
  ArrowUpwardOutlined as ArrowUpwardIcon,
  ArrowDownwardOutlined as ArrowDownwardIcon,
} from "@mui/icons-material";

dayjs.extend(relativeTime); //to convert timestamp to relative time

export function ShowPost() {
  const [postData, setPostData] = useState({});

  const location = useLocation();
  const post_id = location.state?.post_id;

  const { token } = useAuth();

  const navig = useNavigate();

  const [commentTrigger, setCommentTrigger] = useState(0);

  useEffect(() => {
    fetchSpecificPost();
  }, [post_id]); //if post_id changes, page reloads and useEffect runs again


  async function fetchSpecificPost() {
    const response = await fetch(
      `http://localhost:8001/getSpecificPost?post_id=${post_id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    setPostData(data); //set postData to the data object
  }

  async function updateVotes(value) {
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
      fetchSpecificPost();
    }
  }
  return (
    <div>
      <Box
        component="article"
        sx={{
          width: "300px",
          aspectRatio: "1 / 1",
          border: "1px solid grey",
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h6">{postData.title}</Typography>
        <Typography variant="body2">{postData.description}</Typography>
        <Typography variant="body2">{postData.userWhoPosted}</Typography>
        {/*community button */}
        <Button
          size="small"
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            navig("/showSpecificCommunity", {
              state: { community_id: postData.community_id },
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
          Community: {postData.community}
        </Button>
        {dayjs(postData.date_added).fromNow()}

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
            updateVotes(value);
          }}
          sx={{
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {postData.upvotes > 0 &&
            postData.upvotes > postData.downvotes &&
            postData.upvotes}
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
            updateVotes(value);
          }}
          sx={{
            textTransform: "none",
            padding: 0,
            minWidth: "auto",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {postData.downvotes > 0 &&
            postData.downvotes > postData.upvotes &&
            postData.downvotes}
        </Button>
      </Box>

      <AddNewComment post_id={post_id} setCommentTrigger={setCommentTrigger} />

      <CommentsDisplay post_id={post_id} commentTrigger={commentTrigger} setCommentTrigger={setCommentTrigger} />
    </div>
  );
}

//add new comment, fropm the text field, which means its not a reply to someone
function AddNewComment({ post_id, setCommentTrigger }) {
  const [newComment, setNewComment] = useState("");

  const { token } = useAuth();

  async function submitButton(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:8001/createComment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post_id: post_id,
        commentText: newComment,
        addedFromField: true, //a bool to check if it was a reply or not (since its from add field, its not reply)
      }),
    });
    if (response.ok) {
      setNewComment("");
      setCommentTrigger((prev) => prev + 1);
    }
  }

  if (!token) {
    return <p>login to comment</p>;
  } else {
    return (
      <form onSubmit={submitButton}>
        <br />
        <input
          type="text"
          placeholder="Add new comment"
          value={newComment} //store the newcomment to field, so that when submit is clicked, it removes the text 
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

function CommentsDisplay({ post_id, setCommentTrigger, commentTrigger }) {
  const [commentsList, setCommentsList] = useState({});

  const [commentFilter, setCommentFilter] = useState("NoFilter");

  useEffect(() => {
    async function fetchComments() {
      const response = await fetch(
        `http://localhost:8001/getComments?post_id=${post_id}&commentFilter=${commentFilter}`,
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
        setCommentsList(data);
      }
    }
    if (post_id) {
      fetchComments();
    }
  }, [post_id, commentTrigger, commentFilter]);

  const commentTree = buildCommentTree(commentsList); //returns a tree with the nested comments

  return (
    <div>
      <select value={commentFilter} onChange={(e) => setCommentFilter(e.target.value)}>
        <option value="NoFilter" >Without Filter</option>
        <option value="Newest">Newest</option>
        <option value="MostLikes">Most Likes</option>
      </select>

      <Box sx={{ mt: 4, p: 2, borderTop: "1px solid #ddd" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Discussion
        </Typography>

        {commentTree.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        ) : (
          // Only loop over root comments here, nested ones are handled automatically by recursion
          commentTree.map((rootComment) => (
            <CommentNode
              key={rootComment.id}
              post_id={post_id}
              comment={rootComment}
              setCommentTrigger={setCommentTrigger}
              setCommentsList={setCommentsList} // to update votes of comments by state
            />
          ))
        )}
      </Box>
    </div>
  );
}
