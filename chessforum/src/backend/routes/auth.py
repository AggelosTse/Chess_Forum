from flask import request, jsonify
from routes.initializations import app, email_regex
from database.database import db, Users,Roles
from datetime import datetime,timezone
import bcrypt
import jwt
import re


@app.route('/login', methods=["POST"])
def handle_login():
    try:

        data = request.get_json()
        
        if data is None:
            return jsonify({
                "messagetype": "Error",
                "message": "Invalid or missing JSON payload"
            }), 400
            
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({
                "messagetype": "Error",
                "message": "Missing Input" 
            }),400
        
        userData = db.session.execute(db.select(Users).filter_by(username=username)).scalar_one_or_none()    
            
        #check if input password matches the stored one
        if userData:
            if bcrypt.checkpw(password.encode('utf-8'), userData.password.encode('utf-8')):

                if userData.roles:
                    user_role = userData.roles.name #getting role name via the "roles" relationship variable
                else:
                    user_role = "user"
                    
                now = int(datetime.now(timezone.utc).timestamp()) #get current time in timestamp format
                payload = {
                        "iat": now,
                        "exp": now + 1200, #expires in 20 minutes
                        "username": username,
                        "user_id" : userData.id,
                        "role" : user_role
                    }

                token = jwt.encode(payload, app.config["TOKENKEY"], algorithm="HS256")

                return jsonify({
                    "messagetype": "Success",
                    "message": "Logging in",
                    "token": token,
                    "username": username,
                    "user_id" : userData.id,
                    "role" : user_role
                }),200        
                
        return jsonify({
            "messagetype": "Error",
            "message": "Invalid Username or Password" 
        }),401
        
    except Exception as error:
        print("login error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500

@app.route('/signup', methods=["POST"])
def handle_signup():
    try:

        data = request.get_json()
    
        if data is None:
            return jsonify({
                "messagetype": "Error",
                "message": "Invalid or missing JSON payload"
            }), 400
            
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password or not email:
            return jsonify({
                "messagetype": "Error",
                "message": "Missing Input"
                }),400
        
        if len(password) < 8:
            return jsonify({
                "messagetype": "Error", 
                "message": "Password not long enough (>= 8)"
                }), 422

        if not re.match(email_regex, email):
                return jsonify({
                    "messagetype": "Error", 
                    "message": "Invalid Email Format"
                    }), 400
        
        #check if selected username already exists
        existingUsername = db.session.execute(db.select(Users).filter_by(username=username)).scalar_one_or_none()  

        #existingUsername is not null, so a user with that username exists
        if existingUsername:
            return jsonify({
                "messagetype": "Error",
                "message": "Account with that name already exists"
                }),409   
        
        #check if selected email already exists
        existingEmail = db.session.execute(db.select(Users).filter_by(email=email)).scalar_one_or_none() 

        #existingEmail is not null, so a user with that email exist
        if existingEmail:
            return jsonify({
                "messagetype": "Error",
                "message": "Email already exists"
                }),409   

        #stop if you find the first row, if 1 extsts, no need to check the others
        any_user_exists = db.session.execute(db.select(Users.id).limit(1)).scalar()

        if any_user_exists: 
            role_name = "user"
        else: 
            role_name = "admin"

        #find specific role id, to store in user
        role_object = db.session.execute(db.select(Roles).filter_by(name=role_name)).scalar_one_or_none()
        
        if not role_object:
            return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Configuration Error"
            }),500
            
        #hashing password for safety
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        #new user add
        new_user = Users(
                    username=username,
                    password= hashed_password,
                    email=email,
                    role_id=role_object.id #grab id from role_object 
                )
        
        db.session.add(new_user)
        db.session.commit()

    #to get the user id 
        userData = db.session.execute(db.select(Users).filter_by(username=username)).scalar_one_or_none()    

        now = int(datetime.now(timezone.utc).timestamp()) #get current time in timestamp format
        
        payload = {
                    "iat": now,
                    "exp": now + 1200, #expires in 20 minutes
                    "username": username,
                    "user_id" : userData.id,
                    "role" : role_object.name
                }

        token = jwt.encode(payload, app.config["TOKENKEY"], algorithm="HS256")

        return jsonify({
            "messagetype": "Success",
            "message": "Signing Up",
            "token": token,
            "username": username,
            "user_id" : userData.id,
            "role" : role_object.name #grab name attribute from role_object
        }),201

    except Exception as error:
        print("signup error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
