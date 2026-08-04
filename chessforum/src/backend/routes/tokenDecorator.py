from functools import wraps
from flask import request, jsonify,make_response,current_app
import jwt

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

            data = jwt.decode(token, current_app.config["TOKENKEY"], algorithms=["HS256"])

            username = data["username"]
            user_id = data["user_id"]
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

        return f(username, user_id, role, *args, **kwargs)
    return decorator
