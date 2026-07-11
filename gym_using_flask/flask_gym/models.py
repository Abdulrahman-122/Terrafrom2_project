from flask_login import UserMixin
from datetime import datetime
from flask_gym import db

class Member(db.Model, UserMixin):
    member_id      = db.Column(db.Integer, primary_key=True)
    username       = db.Column(db.String(20),  unique=True, nullable=False)
    email          = db.Column(db.String(120), unique=True, nullable=False)
    image_file     = db.Column(db.String(20),  nullable=False, default='default.jpg')
    password       = db.Column(db.String(60),  nullable=False)
    join_date      = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)
    status         = db.Column(db.String(20),  nullable=False, default='not_in_gym')
    trainer_id     = db.Column(db.Integer,     db.ForeignKey('trainer.trainer_id'))

    nutrition_logs = db.relationship('NutritionLog',   backref='member', lazy=True)
    schedule       = db.relationship('WorkoutSchedule', backref='member', lazy=True)

    def get_id(self):
        return str(self.member_id)

    def __repr__(self):
        return f'Member: {self.username}'


class Trainer(db.Model, UserMixin):
    trainer_id       = db.Column(db.Integer,    primary_key=True)
    username         = db.Column(db.String(20), unique=True, nullable=False)
    email            = db.Column(db.String(120),unique=True, nullable=False)
    image_file       = db.Column(db.String(20), nullable=False, default='default.jpg')
    password         = db.Column(db.String(60), nullable=False)
    specialization   = db.Column(db.String(50), nullable=False, default='Weight lifting')
    members_belongs  = db.Column(db.Integer,    nullable=False, default=0)
    status           = db.Column(db.String(20), nullable=False, default='not_in_gym')
    members          = db.relationship('Member', backref='trainer', lazy=True)

    def get_id(self):
        return str(self.trainer_id)

    def __repr__(self):
        return f'Trainer: {self.username}'


class NutritionLog(db.Model):
    id         = db.Column(db.Integer,   primary_key=True)
    member_id  = db.Column(db.Integer,   db.ForeignKey('member.member_id'), nullable=False)
    date       = db.Column(db.Date,      nullable=False, default=datetime.utcnow)
    calories   = db.Column(db.Integer,   nullable=False, default=0)
    protein    = db.Column(db.Integer,   nullable=False, default=0)
    fat        = db.Column(db.Integer,   nullable=False, default=0)

    def __repr__(self):
        return f'NutritionLog: {self.date} cal={self.calories}'


class WorkoutSchedule(db.Model):
    id         = db.Column(db.Integer,  primary_key=True)
    member_id  = db.Column(db.Integer,  db.ForeignKey('member.member_id'), nullable=False)
    day        = db.Column(db.String(3),nullable=False)   # Mon, Tue, Wed...
    workout    = db.Column(db.String(50),nullable=False)  # e.g. "Chest & Triceps"

    def __repr__(self):
        return f'Schedule: {self.day} - {self.workout}'


        
# now check the database after  creating the models
#
# 
# 
# >>> from flask_gym import app,db
# >>> from flask_gym import models
#  >>> with app.app_context():
# ...     db.create_all()
# >>> from flask_gym.models import Trainer, Member
# ... 
# ... with app.app_context():
# ...     t = Trainer(
# ...         username="trainer1",
# ...         email="trainer@test.com",
# ...         password="123"
# ...     )
# ...     db.session.add(t)
# ...     db.session.commit()
# >>> with app.app_context():
# ...     m = Member(
# ...         username="member1",
# ...         email="member@test.com",
# ...         password="123",
# ...         trainer_id=1   
# ...     )
# ...     db.session.add(m)
# ...     db.session.commit()
# ...     
# >>> with app.app_context():
# ...     member = Member.query.first()
# ...     print(member.trainer_id)
# ...     
# 1
# >>> with app.app_context():
# ...     member = Member.query.first()
# ...     print(member.trainer.username)
# ...     
# Abdulrahman


