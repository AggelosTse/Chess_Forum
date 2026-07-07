import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useState } from "react";
import { CommentNode, buildCommentTree} from '../../utils/commentHelper.jsx';

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
                    aspectRatio: '1 / 1', // Matches your exact square post layout
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
                <Typography variant="caption" color="text.secondary">
                    Community: {postData.community}
                </Typography>
            </Box>

            <CommentsDisplay post_id={post_id}/>

        </div>
    );
}

function CommentsDisplay({post_id}) {

    const [commentsList, setCommentsList] = useState({});

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

    const commentTree = buildCommentTree(commentsList);

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
                    <CommentNode key={rootComment.id} comment={rootComment} />
                ))
            )}
        </Box>
    );
}