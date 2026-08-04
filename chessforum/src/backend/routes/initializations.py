from flask import Flask
from flask_migrate import Migrate 
import os 
from dotenv import load_dotenv
import sys 
from flask_cors import CORS

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database.database import db

app = Flask(__name__)

#enable frontend to talk with backend 
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

load_dotenv()

app.config["SQLALCHEMY_DATABASE_URI"]= os.getenv('databaseURL')
app.config['TOKENKEY'] = os.getenv('tokenkey')

db.init_app(app)

migrate = Migrate(app, db) #for database update via code

email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$' #for the email validation


import routes.auth
import routes.posts
import routes.comments
import routes.community
import routes.search