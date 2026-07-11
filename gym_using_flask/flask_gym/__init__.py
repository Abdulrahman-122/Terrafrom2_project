from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_migrate import Migrate
import re
load_dotenv()  # Load environment variables from .env file
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['SESSION_COOKIE_SAMESITE'] = os.getenv("SESSION_COOKIE_SAMESITE")
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# CORS(
#     app,
#     supports_credentials=True,
#     origins=[ 
#         "http://localhost:5173",
#         "http://172.0.0.1:5173"
#     ]
# )
# CORS(
#     app,
#     resources={r"/*":{"origins":"*"}}
# )

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                re.compile(r"^http://localhost:5173$"),
                re.compile(r"^http://127\.0\.0\.1:5173$"),
                re.compile(r"^http://192\.168\.\d{1,3}\.\d{1,3}:5173$"),
                re.compile(r"^http://172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:5173$"),
                re.compile(r"^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$")
            ]
        }
    },
    supports_credentials=True
)


print("DATABASE_URL =", os.getenv("DATABASE_URL"))

migrate=Migrate(app,db)
from flask_gym.models import Member   # ← must come AFTER db is defined 

@login_manager.user_loader            # ← AFTER Member is imported
def load_user(user_id):
    return Member.query.get(int(user_id))

@login_manager.unauthorized_handler   # ← ADD THIS
def unauthorized():
    return jsonify({'message': 'Unauthorized'}), 401

