from flask import request, jsonify
from routes.initializations import app
from database.database import db, CommentVotes, Comments
from routes.tokenDecorator import token_required


@app.route("/updateCommentVotes", methods=["POST"])
@token_required
def update_commentvotes(username, user_id ,role):

    try:

        data = request.get_json()
                
        current_vote = data.get("vote")
        comment_id = data.get("comment_id")
                    
        existing_vote = db.session.execute(db.select(CommentVotes).filter_by(comment_id=comment_id, user_id=user_id)).scalar_one_or_none()

        current_comment = db.session.get(Comments, comment_id)

        #if existing vote returns none, user never voted for this comment before
        if not existing_vote:

            #add new vote 
            new_vote = CommentVotes(
                vote=current_vote,
                comment_id=comment_id,
                user_id=user_id,
                
            )

            db.session.add(new_vote)

            if current_vote == "upvoted" : 
                current_comment.upvotes +=1
            elif current_vote == "downvoted": 
                current_comment.downvotes += 1
                
            db.session.commit()

            #send back specific's post votes so it can be displayed instantly
            return jsonify({
                "upvotes": current_comment.upvotes,
                "downvotes": current_comment.downvotes
            }), 200

        if existing_vote.vote == "upvoted":
                    
            if current_vote == "upvoted":

                current_comment.upvotes -= 1
                
                db.session.delete(existing_vote)    #if upvote is clicked for a second time, it counts as unvote (deleting vote)
                

            elif current_vote == "downvoted":

                current_comment.upvotes -= 1
                current_comment.downvotes += 1

                existing_vote.vote = "downvoted"

        elif existing_vote.vote == "downvoted":

            if current_vote == "downvoted":

                current_comment.downvotes -= 1
                
                db.session.delete(existing_vote)    #if downvote is clicked for a second time, it counts as unvote (deleting vote)
                
            elif current_vote == "upvoted":

                current_comment.upvotes += 1
                current_comment.downvotes -= 1

                existing_vote.vote = "upvoted"

        db.session.commit()

        #send back specific's post votes so it can be displayed instantly
        return jsonify({
            "upvotes": current_comment.upvotes,
            "downvotes": current_comment.downvotes
        }), 200

    except Exception as error:
            print("update post vote error")
            print(str(error))

            return jsonify({
                "messagetype": "Error",
                "message": "Internal Server Error"
                }),500 

    
@app.route("/getComments", methods=["GET"])
def handleGetComments():
    try:

        post_id = request.args.get("post_id")
        commentFilter = request.args.get("commentFilter")

        if commentFilter == "NoFilter":

            #get all comments that are in this specific post without 
            comments = db.session.execute(db.select(Comments).filter_by(post_id=post_id)).scalars().all()

        elif commentFilter == "Newest":

            comments = db.session.execute(db.select(Comments).filter_by(post_id=post_id).order_by(Comments.date_added.desc())).scalars().all()

        elif commentFilter == "MostLikes":

            comments = db.session.execute(db.select(Comments).filter_by(post_id=post_id).order_by(Comments.upvotes.desc())).scalars().all()

        if comments is not None:

            comments_list = []

            for comment in comments:
                comments_list.append({
                "id": comment.id,                             
                "parent_id": comment.parent_id,               
                "text": comment.text,                         
                "username": comment.users.username,
                "upvotes" : comment.upvotes,
                "downvotes" : comment.downvotes,
                "date_added" : comment.date_added
            })
                
            return jsonify(comments_list),200

    except Exception as error:
        print("getComments error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    

@app.route("/createComment", methods=["POST"])
@token_required
def handleAddComment(username, user_id ,role):
    try:

        data = request.get_json()
        post_id = data.get("post_id")
        commentText = data.get("commentText")
        addedFromField = data.get("addedFromField")

        print(post_id, commentText, addedFromField)

        if addedFromField: parent_id = None
        else: parent_id = data.get("parent_id")

        new_comment = Comments(
            text=commentText,
            user_id=user_id,
            parent_id=parent_id,
            post_id=post_id
        )
    
        db.session.add(new_comment)
        db.session.commit()
        
        return jsonify({
        "messagetype": "Success",
        "message": "Comment Added Successfully"
        }),200
    

    except Exception as error:
        print("addComment error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
