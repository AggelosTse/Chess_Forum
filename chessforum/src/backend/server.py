from flask import Flask, request, jsonify,make_response
from flask_migrate import Migrate 
import os 
from dotenv import load_dotenv
import sys 
import jwt
from datetime import datetime, timedelta,timezone
import bcrypt
import re
from sqlalchemy import func
from flask_cors import CORS
from functools import wraps

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.database import db, Roles,Users,Posts,Comments,Subchessits

app = Flask(__name__)

#enable frontend to talk with backend 
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

load_dotenv()

app.config["SQLALCHEMY_DATABASE_URI"]= os.getenv('databaseURL')
app.config['TOKENKEY'] = os.getenv('tokenkey')

db.init_app(app)

migrate = Migrate(app, db) #for database update via code

email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$' #for the email validation

#authentication decorator
def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]

            token = auth_header.split(" ")[1] if " " in auth_header else auth_header

        if not token:
            return make_response(jsonify({
                "messagetype": "Error",
                "message": "A valid token is missing!"
                }), 401)

        try:

            data = jwt.decode(token, app.config["TOKENKEY"], algorithms=["HS256"])

            username = data["username"]
            role = data["role"]

        except jwt.ExpiredSignatureError:
            return make_response(jsonify({
                "messagetype": "Error",
                "message": "Token has expired!"
                }), 401)
        
        except jwt.InvalidTokenError:
            return make_response(jsonify({
                "messagetype": "Error",
                "message": "Invalid token!"
                }), 401)
        
        except Exception as e:
            return make_response(jsonify({
                "messagetype": "Error",
                "message": str(e)
                }), 401)

        return f(username, role, *args, **kwargs)
    return decorator


@app.route('/login', methods=["POST"])
def handleLogin():
    try:

        data = request.get_json()
        
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({
                "messagetype": "Error",
                "message": "Missing Input" 
            }),400
        
        userData = db.session.execute(db.select(Users).filter_by(username=username)).scalar_one_or_none()    
            
        #check if input password matches the stored one
        if not userData or not bcrypt.checkpw(password.encode('utf-8'), userData.password.encode('utf-8')):
            return jsonify({
                "messagetype": "Error",
                "message": "Invalid Username or Password" 
            }),401

        user_role = userData.roles.name #getting role name via the "roles" relationship variable
        
        payload = {
                "iat": datetime.now(timezone.utc),
                "exp": datetime.now(timezone.utc) + timedelta(hours=1), #expires in 1 hour
                "username": username,
                "role" : user_role
            }

        token = jwt.encode(payload, app.config["TOKENKEY"], algorithm="HS256")

        return jsonify({
            "messagetype": "Success",
            "message": "Logging in",
            "token": token,
            "username": username,
            "role" : user_role
        }),200

    except Exception as error:
        print("login error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500

@app.route('/signup', methods=["POST"])
def handleSignup():
    try:

        data = request.get_json()
    
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password or not email:
            return jsonify({
                "messagetype": "Error",
                "message": "Missing Input"
                }),400
        
        if len(password) <= 8:
            return jsonify({
                "messagetype": "Error", 
                "message": "Password not long enough (>8)"
                }), 422

        if not re.match(email_regex, email):
                return jsonify({
                    "messagetype": "Error", 
                    "message": "Invalid Email Format"
                    }), 400
        
        #check if user already exists
        existingUser = db.session.execute(db.select(Users).filter_by(username=username)).scalar_one_or_none()  

        if existingUser is not None:
            return jsonify({
                "messagetype": "Error",
                "message": "Account with that name already exists"
                }),409   
        

        emailExists = db.session.execute(db.select(Users).filter_by(email=email)).scalar_one_or_none() 

        if emailExists is not None:
            return jsonify({
                "messagetype": "Error",
                "message": "Email already exists"
                }),409   

        usersCount = db.session.query(func.count(Users.id)).scalar()

        if usersCount == 0: role_name = "admin"
        else: role_name = "user"

        #find specific role id, to store in user
        role_object = db.session.execute(db.select(Roles).filter_by(name=role_name)).scalar_one_or_none()
        
        #hashing password for safety
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        #new user add
        new_user = Users(
                    username=username,
                    password= hashed_password,
                    email=email,
                    role_id=role_object.id
                )
        
        db.session.add(new_user)
        db.session.commit()

        payload = {
                    "iat": datetime.now(timezone.utc),
                    "exp": datetime.now(timezone.utc) + timedelta(hours=1), #expires in 1 hour
                    "username": username
                }

        token = jwt.encode(payload, app.config["TOKENKEY"], algorithm="HS256")

        return jsonify({
            "messagetype": "Success",
            "message": "Signing Up",
            "token": token
        }),200

    except Exception as error:
        print("signup error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500
    
@app.route("/createCommunity", methods=["POST"])
@token_required
def handleCreateCommunity(username,role):
    try:

        data = request.get_json()

        title = data.get("title")
        description = data.get("description")

        #check if user's community name choise already exists
        existingCommunity = db.session.execute(db.Select(Subchessits).filter_by(title=title)).scalar_one_or_none()

        if existingCommunity is not None:
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

if __name__ == "__main__":
    with app.app_context():
        db.create_all() #create the database tables
    app.run(debug=True, port=8001)