import { Box, Typography } from '@mui/material';

export function buildCommentTree(flatComments) {
    const commentsArray = Array.isArray(flatComments) ? flatComments : Object.values(flatComments);
    
    const map = {};
    const tree = [];
    commentsArray.forEach(comment => {
        if (comment && comment.id) {
            map[comment.id] = { ...comment, children: [] };
        }
    });

    commentsArray.forEach(comment => {
        if (!comment || !comment.id) return;
        
        const mappedComment = map[comment.id];

        if (comment.parent_id && map[comment.parent_id]) {
            map[comment.parent_id].children.push(mappedComment);
        } else {
            tree.push(mappedComment);
        }
    });

    return tree;
}

export function CommentNode({ comment }) {
    return (
        <Box 
            sx={{ 
                pl: comment.parent_id ? 3 : 0, // Indents nested replies
                mt: 2, 
                borderLeft: comment.parent_id ? '2px solid #e0e0e0' : 'none' // Creates visual threads
            }}
        >
            <Box sx={{ p: 1.5, bgcolor: '#f9f9f9', borderRadius: '4px' }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                    {comment.username || "Anonymous"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {comment.text}
                </Typography>
            </Box>

            {comment.children && comment.children.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    {comment.children.map((childComment) => (
                        <CommentNode key={childComment.id} comment={childComment} />
                    ))}
                </Box>
            )}
        </Box>
    );
}