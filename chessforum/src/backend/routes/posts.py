from flask import request, jsonify
from routes.initializations import app
from database.database import db, Subchessits, Posts, PostVotes
from routes.tokenDecorator import token_required


@app.route("/getPostsData", methods=["GET"])
def handle_postsData():
    try:
        #grab posts from unique communities
        feed_posts = db.session.execute(db.select(Posts)).scalars().all()
        
        posts_dict = {}
        unique_communities = []

        #return all posts that have unique communities 
        for post in feed_posts:
            if post.subchessit_id not in unique_communities:

                unique_communities.append(post.subchessit_id)

                community_name = post.subchessits.title #grab community name by "subchessit" relationship object

                userWhoPosted = post.users.username

                #make the object to return
                posts_dict[post.id] = {
                    "title": post.title,
                    "image": post.image,
                    "user_id": post.user_id,
                    "userWhoPosted" : userWhoPosted,
                    "community_id": post.subchessit_id,
                    "community_name": community_name,  #keep community name to display in frontend
                    "description": post.description,
                    "upvotes" : post.upvotes,   #total upvotes and downvotes
                    "downvotes" : post.downvotes,
                    "date_added" : post.date_added
                }
           
        
        return jsonify(posts_dict),200

    except Exception as error:
        print("getPostsData error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/getSpecificPost", methods=["GET"])
def handle_specificPost():
    try:
        post_id = request.args.get("post_id")

        #it has user_id and subchessit_id as integers
        specificPostData = db.session.execute(db.select(Posts).filter_by(id=post_id)).scalar_one_or_none()

        if not specificPostData:
            return jsonify({
                    "messagetype": "Error",
                    "message": "Post Doesnt Exist"
                    }),404
        
        userWhoPosted = specificPostData.users.username #using the "users" relationship object

        communityOfPost = specificPostData.subchessits.title #get the community in which the post is added

        return jsonify({
            "title": specificPostData.title,
            "description" : specificPostData.description,
            "userWhoPosted" : userWhoPosted,
            "community" : communityOfPost,
            "community_id" : specificPostData.subchessit_id,
            "upvotes" : specificPostData.upvotes,
            "downvotes" : specificPostData.downvotes,
            "date_added" : specificPostData.date_added

        }),200
    

    except Exception as error:
        print("getSpecificPost error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/getSpecificCommunityPosts", methods=["GET"])
def handleGetCommunity():

    community_id = request.args.get("community_id")

    try:
        #grab current community 
        current_community= db.session.get(Subchessits, community_id)

        if not current_community:
            return jsonify({
                "messagetype": "Error", 
                "message": "Community not found"
                }), 404
            
        #grab its name
        community_name = current_community.title

        #grab the date the community was added
        community_date_added = current_community.date_added
        
        #grab all posts from the selected community via "posts" relationship object
        community_posts = current_community.posts
        
        posts_dict = {}
        for community_post in community_posts:

            userWhoPosted = community_post.users.username #using the "users" relationship object

            #make the object to return
            posts_dict[community_post.id] = {
                "title": community_post.title,
                "image": community_post.image,
                "user_id": community_post.user_id,
                "userWhoPosted" : userWhoPosted,
                "community_name": community_name,  #keep community name to display in frontend
                "community_id" : community_post.subchessit_id,
                "description": community_post.description,
                "upvotes" : community_post.upvotes,
                "downvotes" : community_post.downvotes,
                "date_added" : community_post.date_added, #every post date added
                "community_date_added" : community_date_added    #community date added

            }
        
        return jsonify(posts_dict),200

    except Exception as error:
        print("getSpecificCommunityPosts error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500

@app.route("/createPost", methods=["POST"])
@token_required
def create_post(username, user_id ,role):
    try:
        
        data = request.get_json()
        
        title = data.get("title")
        description = data.get("description")
        community_id = data.get("community_id")
            
        if not title:
                return jsonify({
                    "messagetype": "Error",
                    "message": "Title is required" 
                }),400
        
        if community_id:
            community_exists = db.session.get(Subchessits, community_id)
            if not community_exists:
                return jsonify({
                    "messagetype": "Error",
                    "message": "Couldnt find community" 
                }),404
            
        new_post = Posts(
            title=title,
            image=None,
            description=description,
            user_id=user_id,
            subchessit_id=community_id,
            upvotes=0,
            downvotes=0
        )
        
        db.session.add(new_post)
        db.session.commit()

        return jsonify({
            "messagetype": "Success",
            "message": "Post Created Successfully"
        }),200
        
    except Exception as error:
        print("create post error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500 
        

@app.route("/updatePostVotes", methods=["POST"])
@token_required
def update_postvotes(username, user_id ,role):
    try:
        data = request.get_json()
        
        current_vote = data.get("vote")
        post_id = data.get("post_id")
            
        existing_vote = db.session.execute(db.select(PostVotes).filter_by(post_id=post_id, user_id=user_id)).scalar_one_or_none()

        current_post = db.session.get(Posts, post_id)

        #if existing vote returns none, user never voted for this post before
        if not existing_vote:

            #add new vote 
            new_vote = PostVotes(
                vote=current_vote,
                user_id=user_id,
                post_id=post_id
            )

            db.session.add(new_vote)

            

            if current_vote == "upvoted" : 
                current_post.upvotes +=1
            elif current_vote == "downvoted": 
                current_post.downvotes += 1
                
            db.session.commit()

            #send back specific's post votes so it can be displayed instantly
            return jsonify({
                "upvotes": current_post.upvotes,
                "downvotes": current_post.downvotes
            }), 200

        if existing_vote.vote == "upvoted":
            
            if current_vote == "upvoted":

                current_post.upvotes -= 1
                
                db.session.delete(existing_vote)    #if upvote is clicked for a second time, it counts as unvote (deleting vote)
                

            elif current_vote == "downvoted":

                current_post.upvotes -= 1
                current_post.downvotes += 1

                existing_vote.vote = "downvoted"

        elif existing_vote.vote == "downvoted":

            if current_vote == "downvoted":

                current_post.downvotes -= 1
                
                db.session.delete(existing_vote)    #if downvote is clicked for a second time, it counts as unvote (deleting vote)
                
            elif current_vote == "upvoted":

                current_post.upvotes += 1
                current_post.downvotes -= 1

                existing_vote.vote = "upvoted"


        db.session.commit()

        #send back specific's post votes so it can be displayed instantly
        return jsonify({
            "upvotes": current_post.upvotes,
            "downvotes": current_post.downvotes
        }), 200
       
    except Exception as error:
        print("update post vote error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500 
