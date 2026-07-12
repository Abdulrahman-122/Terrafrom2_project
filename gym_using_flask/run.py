import os
from flask import request, jsonify, send_from_directory ,make_response
from werkzeug.utils import secure_filename
from flask_gym.models import Member, Trainer, NutritionLog, WorkoutSchedule
from flask_login import login_required, current_user, login_user, logout_user
from flask_gym import app, db, bcrypt
from datetime import date



@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'message': 'ok'}), 200

    username = data.get('username')
    email    = data.get('email')
    password = data.get('password')
    days     = data.get('days', [])      

    if Member.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed   = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = Member(username=username, email=email, password=hashed)
    db.session.add(new_user)
    db.session.flush()   

    default_workouts = {
        'Mon': 'Back & Biceps',
        'Tue': 'Legs',
        'Wed': 'Rest day',
        'Thu': 'Chest & Triceps',
        'Fri': 'Shoulders',
        'Sat': 'Arms',
        'Sun': 'Rest day',
    }

    for day in days:
        schedule = WorkoutSchedule(
            member_id=new_user.member_id,
            day=day,
            workout=default_workouts.get(day, 'General Workout')
        )
        db.session.add(schedule)

    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    user = Member.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):

        login_user(user, remember=True)

        return jsonify({
            'success': True,
            'message': 'Logged in successfully'
        }), 200

    return jsonify({
        'success': False,
        'message': 'Invalid email or password'
    }), 401

@app.route("/health",methods=["GET"])
@login_required
def healthy():
    return jsonify({
        "status":"healthy"
    }),200


@app.route('/home', methods=['GET'])
@login_required
def home():
    trainer_name = 'Not assigned'
    if current_user.trainer_id:
        trainer = Trainer.query.get(current_user.trainer_id)
        if trainer:
            trainer_name = trainer.username

    today_log = NutritionLog.query.filter_by(
        member_id=current_user.member_id, date=date.today()
    ).first()

    schedule = WorkoutSchedule.query.filter_by(
        member_id=current_user.member_id
    ).all()

    return jsonify({
        'user': {
            'username':   current_user.username,
            'email':      current_user.email,
            'status':     current_user.status,
            'join_date':  current_user.join_date.strftime('%b %Y'),
            'trainer':    trainer_name,
            'image_file': current_user.image_file,
        },
        'nutrition': {
            'calories': today_log.calories if today_log else 0,
            'protein':  today_log.protein  if today_log else 0,
            'fat':      today_log.fat      if today_log else 0,
        },
        'schedule': [{'day': s.day, 'workout': s.workout} for s in schedule]
    }), 200

@app.route('/checkin', methods=['POST'])
@login_required
def checkin():
    current_user.status = 'in_gym'
    db.session.commit()
    return jsonify({'message': 'Checked in!', 'status': 'in_gym'}), 200


@app.route('/checkout', methods=['POST'])
@login_required
def checkout():
    current_user.status = 'not_in_gym'
    db.session.commit()
    return jsonify({'message': 'Checked out!', 'status': 'not_in_gym'}), 200


@app.route('/nutrition', methods=['POST'])
@login_required
def log_nutrition():
    data     = request.json
    calories = int(data.get('calories', 0))
    protein  = int(data.get('protein',  0))
    fat      = int(data.get('fat',      0))

    # update if already logged today, otherwise create new
    today_log = NutritionLog.query.filter_by(
        member_id=current_user.member_id,
        date=date.today()
    ).first()

    if today_log:
        today_log.calories = calories
        today_log.protein  = protein
        today_log.fat      = fat
    else:
        new_log = NutritionLog(
            member_id=current_user.member_id,
            calories=calories,
            protein=protein,
            fat=fat,
            date=date.today()
        )
        db.session.add(new_log)

    db.session.commit()
    return jsonify({'message': 'Nutrition logged!'}), 200


@app.route('/trainers', methods=['GET'])
@login_required
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify({
        'trainers': [
            {
                'id':             t.trainer_id,
                'name':           t.username,
                'specialization': t.specialization,
                'members_count':  t.members_belongs,
            }
            for t in trainers
        ]
    }), 200


@app.route('/assign_trainer', methods=['POST'])
@login_required
def assign_trainer():
    data       = request.json
    trainer_id = data.get('trainer_id')
    trainer    = Trainer.query.get(trainer_id)
    if not trainer:
        return jsonify({'message': 'Trainer not found'}), 404

    current_user.trainer_id = trainer_id
    db.session.commit()
    return jsonify({'message': f'{trainer.username} assigned successfully'}), 200


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

#--------------------------------- Handling profile for the member
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'profiles')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/profile', methods=['GET'])
@login_required
def get_profile():
    trainer_name = 'Not assigned'
    if current_user.trainer_id:
        trainer = Trainer.query.get(current_user.trainer_id)
        if trainer:
            trainer_name = trainer.username
    return jsonify({
        'username':   current_user.username,
        'email':      current_user.email,
        'join_date':  current_user.join_date.strftime('%b %Y'),
        'trainer':    trainer_name,
        'image_file': current_user.image_file,
    }), 200


@app.route('/profile/upload', methods=['POST'])
@login_required
def upload_profile_image():
    if 'image' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file type'}), 400

    filename  = secure_filename(f"member_{current_user.member_id}_{file.filename}")
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    current_user.image_file = filename
    db.session.commit()
    return jsonify({'message': 'Image uploaded!', 'image_file': filename}), 200


@app.route('/static/profiles/<filename>')
def profile_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)




if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True,port=5000)