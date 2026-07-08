import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useState } from "react";
import { CommentNode, buildCommentTree} from '../../utils/commentTreeFormat.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

export function ShowPost() {

    const [postData, setPostData] = useState({});

    const location = useLocation();
    const post_id = location.state?.post_id;

    useEffect(() => {
        async function fetchSpecificPost() {

            const response = await fetch(`http://localhost:8001/getSpecificPost?post_id=${post_id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json();

            setPostData(data); //set postData to the data object
        }

        if (post_id) {
            fetchSpecificPost();
        }
    }, [post_id]);  //if post_id changes, page reloads and useEffect runs again



    return (
        <div>
            <Box
                component="article"
                sx={{
                    width: '300px',
                    aspectRatio: '1 / 1', 
                    border: '1px solid grey',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                }}
            >
                <Typography variant="h6">{postData.title}</Typography>
                <Typography variant="body2">{postData.description}</Typography>
                <Typography variant="body2">{postData.userWhoPosted}</Typography>
                <Typography variant="caption" color="text.secondary">
                    Community: {postData.community}
                </Typography>
            </Box>
            
            <AddNewComment post_id={post_id} />

            <CommentsDisplay post_id={post_id}/>

        </div>
    );
}

//add new comment, fropm the text field, which means its not a reply to someone
function AddNewComment({post_id}){

    const [newComment, setNewComment] = useState("");

    const {username,token} = useAuth();

    async function submitButton(e){

        e.preventDefault();

        const response = await fetch("http://localhost:8001/addNewComment", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "post_id": post_id,    
                    "commentText" : newComment,  
                    "addedFromField": true   //a bool to check if it was a reply or not (since its from add field, its not reply)
                })
            })
    }

    if(!token){
        return(
            <p>login to comment</p>
        );
    }
    else{

        return(
        <form onSubmit={submitButton}>
            <br/>
            <input
                type="text"
                placeholder="Add new comment"
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    );
    }
    
}


function CommentsDisplay({post_id}) {

    const [commentsList, setCommentsList] = useState({});

    const [commentTrigger, setCommentTrigger] = useState(0);   

    useEffect(()=>{

        async function fetchComments(){

                const response = await fetch(`http://localhost:8001/getComments?post_id=${post_id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })

                const data = await response.json();

                if(response.ok){
                    setCommentsList(data);
                }

            }
        if(post_id){
            fetchComments();
        }
    },[post_id]);

    const commentTree = buildCommentTree(commentsList); //returns a tree with the nested comments

    return (
        <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #ddd' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Discussion</Typography>
            
            {commentTree.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No comments yet.
                </Typography>
            ) : (
                // Only loop over root comments here, nested ones are handled automatically by recursion
                commentTree.map((rootComment) => (
                    <CommentNode key={rootComment.id} post_id={post_id} comment={rootComment} setCommentTrigger={setCommentTrigger}/>
                    
                ))
            )}
        </Box>
    );
}