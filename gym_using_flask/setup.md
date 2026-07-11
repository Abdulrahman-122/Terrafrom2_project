first you need to modify the database server that you will work on;
1.in my case i will use mariadb as i am using arch linux
go into your db server; mariadb -u root -p
build a new database;  create database name ; in my case gym_system
make a user to control this datebase ; in my case; i made it gym_developer
then
create user gym_developer@localhost identified by 'password'

give him all privileges on that database; like this ;
GRANT ALL PRIVILEGES ON gym_system.* TO 'gym_developer'@'localhost';
flush privileges

check this on the server ; go into the server using this user and see whether you can update,create tables 
if you can okay go to next stage;
2.connect database  with flask 
 like this ;
 app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://gym_developer:password@localhost/gym_system"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
now go i will walk you through the files to understand how it's going
first; 
start loooking at;
--init--.py 
then
go to models.py


some testing;


----------

info about the app how I entered data inside python from terminal

>>> from flask_gym import db,app,bcrypt
>>> from flask_gym.models import trainer 
>>> with app.app_context():
...     trainers=[ Trainer(username="Ahmed Hassan",
...     email="ahmed@gym.com",
...     password=bcrypt.generate_password_hash('trainer123').\
decode('utf-8'),
...     specialization="Weight Lifting",
...     members_belongs=0,
...     status="not_in_gym"),
...     Trainer(
...      >>> with app.app_context():
...     trainers=[ Trainer(username="Ahmed Hassan",
...     email="ahmed@gym.com",
...     password=bcrypt.generate_password_hash('trainer123').\
decode('utf-8'),
...     specialization="Weight Lifting",
...     members_belongs=0,
...     status="not_in_gym"),
...     Trainer(
...             username="Mohamed Ali",
...             email="mohamed@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="Cardio & Fitness",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...         Trainer(
...             username="Omar Khaled",
...             email="omar@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="Bodybuilding",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...         Trainer(
...             username="Youssef Nasser",
...             email="youssef@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="CrossFit",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...     ]
...     db.session.add_all(trainers)
...     db.session.commit()
...     print('Trainers added successfully!!')
...     
Trainers added successfully!!
>>> with app.app_context():
...     for t in Trainer.query.all():
...         print(t.trainer_id,t.username,t.specialization,t.\
password)
...         
1 Abdulrahman Weight lifting 1234
2 trainer1 Weight lifting 123
4 Ahmed Hassan Weight Lifting $2b$12$FXoxLN3oHsm1YBYbvmg7f.doalvGl6nr3JA0rQ5E3MXpcpS9xZHwO
5 Mohamed Ali Cardio & Fitness $2b$12$kc6WLFg9raNevVrRcO3eVeCy86OMhnSGiM63HAnKlYAZkCNU3MU/W
6 Omar Khaled Bodybuilding $2b$12$7947h35mBtp1WUiuOaNJjehKTwGT7zIZiv7EBUhZqujNAGzC3Xg/W
7 Youssef Nasser CrossFit $2b$12$F6uNPISH6QVrA5wol7Jy0OAafvsF36zp5IMN11D.8HQYHA9J5lGWW
       username="Mohamed Ali",
...             email="mohamed@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="Cardio & Fitness",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...         Trainer(
...             username="Omar Khaled",
...             email="omar@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="Bodybuilding",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...         Trainer(
...             username="Youssef Nasser",
...             email="youssef@gym.com",
...             password=bcrypt.generate_password_hash("train\
er123").decode('utf-8'),
...             specialization="CrossFit",
...             members_belongs=0,
...             status="not_in_gym"
...         ),
...     ]
...     db.session.add_all(trainers)
...     db.session.commit()
...     print('Trainers added successfully!!')
...     
Trainers added successfully!!
>>> with app.app_context():
...     for t in Trainer.query.all():
...         print(t.trainer_id,t.username,t.specialization,t.\
password)
...         
1 Abdulrahman Weight lifting 1234
2 trainer1 Weight lifting 123
4 Ahmed Hassan Weight Lifting $2b$12$FXoxLN3oHsm1YBYbvmg7f.doalvGl6nr3JA0rQ5E3MXpcpS9xZHwO
5 Mohamed Ali Cardio & Fitness $2b$12$kc6WLFg9raNevVrRcO3eVeCy86OMhnSGiM63HAnKlYAZkCNU3MU/W
6 Omar Khaled Bodybuilding $2b$12$7947h35mBtp1WUiuOaNJjehKTwGT7zIZiv7EBUhZqujNAGzC3Xg/W
7 Youssef Nasser CrossFit $2b$12$F6uNPISH6QVrA5wol7Jy0OAafvsF36zp5IMN11D.8HQYHA9J5lGWW
