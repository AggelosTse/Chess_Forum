from flask import request, jsonify
from routes.initializations import app
from database.database import db, Subchessits
from routes.tokenDecorator import token_required

@app.route("/createCommunity", methods=["POST"])
@token_required
def create_community(username, user_id ,role):
    try:

        data = request.get_json()

        if data is None:
            return jsonify({
                "messagetype": "Error",
                "message": "Invalid or missing JSON payload"
            }), 400
            
        title = data.get("title")
        description = data.get("description")

        if not title:
            return jsonify({
                "messagetype": "Error",
                "message": "Title is required" 
            }),400

        #check if user's community name choise already exists
        existingCommunity = db.session.execute(db.select(Subchessits).filter_by(title=title)).scalar_one_or_none()
        

        if existingCommunity:
            return jsonify({
                "messagetype": "Error",
                "message": "Community Name already exists"
                }),409   
        
        new_community = Subchessits(
            title = title,
            description = description
        )

        db.session.add(new_community)
        db.session.commit()

        return jsonify({
            "messagetype": "Success",
            "message": "Community Created Successfully"
        }),200
    
    except Exception as error:
        print("createCommunity error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
