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


