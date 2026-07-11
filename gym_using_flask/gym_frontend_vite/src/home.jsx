import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ALL_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TODAY_IDX  = new Date().getDay();                        // 0=Sun..6=Sat
const TODAY_NAME = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][TODAY_IDX];
const API=import.meta.env.VITE_API_URL;
const WORKOUTS = [
  { name: "Bench press",      sets: "4 sets × 8 reps"  },
  { name: "Incline DB press", sets: "3 sets × 10 reps" },
  { name: "Cable fly",        sets: "3 sets × 12 reps" },
  { name: "Dips",             sets: "3 sets × 12 reps" },
  { name: "Pec deck",         sets: "3 sets × 15 reps" },
  { name: "Push-ups",         sets: "2 sets × failure" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const CAL_TARGET  = 2400;
const PRO_TARGET  = 180;
const FAT_TARGET  = 60;

export default function Home() {
  const [user,         setUser]         = useState(null);
  const [nutrition,    setNutrition]    = useState({ calories: 0, protein: 0, fat: 0 });
  const [schedule,     setSchedule]     = useState([]);
  const [done,         setDone]         = useState([]);
  const [showTrainers, setShowTrainers] = useState(false);
  const [trainers,     setTrainers]     = useState([]);
  const [loadingT,     setLoadingT]     = useState(false);
  const [assigning,    setAssigning]    = useState(false);
  const [showNutrition,setShowNutrition]= useState(false);
  const [nutForm,      setNutForm]      = useState({ calories:'', protein:'', fat:'' });
  const [checkingIn,   setCheckingIn]   = useState(false);
  const navigate = useNavigate();

 useEffect(() => {
  axios
    .get(`${API}/home`, {
      withCredentials: true
    })
    .then((res) => {
      console.log("HOME DATA", res.data);

      setUser(res.data.user);
      setNutrition(res.data.nutrition);
      setSchedule(res.data.schedule);
    })
    .catch((err) => {
      console.log("HOME ERROR");
      console.log(err.response);

      navigate("/login");
    });
}, [navigate]);
  const toggle = (i) =>
    setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  // ── Check in / out ──
  const handleCheckInOut = async () => {
    setCheckingIn(true);
    const isIn    = user.status === 'in_gym';
    const route   = isIn ? '/checkout' : '/checkin';
    const newStatus = isIn ? 'not_in_gym' : 'in_gym';
    try {
      await axios.post(`${API}${route}`, {}, { withCredentials: true });
      setUser(prev => ({ ...prev, status: newStatus }));
    } catch {
      alert('Failed to update gym status.');
    } finally {
      setCheckingIn(false);
    }
  };

  // ── Trainers ──
  const openTrainerPicker = async () => {
    setShowTrainers(true);
    setLoadingT(true);
    try {
      const res = await axios.get(`${API}/trainers`, { withCredentials: true });
      setTrainers(res.data.trainers);
    } catch {
      alert("Could not load trainers.");
      setShowTrainers(false);
    } finally {
      setLoadingT(false);
    }
  };

  const assignTrainer = async (trainer) => {
    setAssigning(true);
    try {
      await axios.post(`${API}/assign_trainer`,
        { trainer_id: trainer.id }, { withCredentials: true });
      setUser(prev => ({ ...prev, trainer: trainer.name }));
      setShowTrainers(false);
    } catch {
      alert("Failed to assign trainer.");
    } finally {
      setAssigning(false);
    }
  };

  // ── Nutrition ──
  const submitNutrition = async () => {
    try {
      await axios.post(`${API}/nutrition`, {
        calories: Number(nutForm.calories) || 0,
        protein:  Number(nutForm.protein)  || 0,
        fat:      Number(nutForm.fat)      || 0,
      }, { withCredentials: true });
      setNutrition({
        calories: Number(nutForm.calories) || 0,
        protein:  Number(nutForm.protein)  || 0,
        fat:      Number(nutForm.fat)      || 0,
      });
      setShowNutrition(false);
    } catch {
      alert("Failed to log nutrition.");
    }
  };

  if (!user) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger" role="status" />
      <p className="mt-2 text-muted">Loading dashboard...</p>
    </div>
  );

  const initials    = user.username.slice(0, 2).toUpperCase();
  const progress    = Math.round((done.length / WORKOUTS.length) * 100);
  const statusIn    = user.status === 'in_gym';

  // build full week from member's chosen days
  const fullSchedule = ALL_DAYS.map(day => {
    const found = schedule.find(s => s.day === day);
    return {
      day,
      workout: found ? found.workout : 'Rest day',
      status:
        day === TODAY_NAME ? 'today' :
        ALL_DAYS.indexOf(day) < ALL_DAYS.indexOf(TODAY_NAME) ? 'done' : 'upcoming',
    };
  });

  const todayWorkout = fullSchedule.find(s => s.day === TODAY_NAME);

  const pct = (val, target) => Math.min(Math.round((val / target) * 100), 100);

  return (
    <div className="container mt-4 pb-5">

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">{getGreeting()}, {user.username}</h4>
          <small className="text-muted">{user.email}</small>
        </div>
        {/* in the header section of home.jsx */}
{user.image_file && user.image_file !== 'default.jpg' ? (
  <img
    src={`${API}/static/profiles/${user.image_file}`}
    alt="profile"
    onClick={() => navigate('/profile')}
    style={{ width: 44, height: 44, borderRadius: '50%',
             objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
  />
) : (
  <div
    className="rounded-circle bg-danger text-white d-flex align-items-center
               justify-content-center fw-bold"
    onClick={() => navigate('/profile')}
    style={{ width: 44, height: 44, flexShrink: 0, cursor: 'pointer' }}
  >
    {initials}
  </div>
)}
      </div>

      {/* ── Stat cards ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="bg-light rounded p-3 h-100">
            <div className="text-muted small">Member since</div>
            <div className="fs-5 fw-semibold">{user.join_date}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-light rounded p-3 h-100">
            <div className="text-muted small">Exercises done</div>
            <div className="fs-5 fw-semibold">{done.length} / {WORKOUTS.length}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>today</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-light rounded p-3 h-100">
            <div className="text-muted small">Gym status</div>
            <div className={`fs-5 fw-semibold ${statusIn ? 'text-success' : 'text-danger'}`}>
              {statusIn ? 'In gym' : 'Outside'}
            </div>
            <button
              className={`btn btn-sm mt-1 ${statusIn ? 'btn-outline-danger' : 'btn-outline-success'}`}
              style={{ fontSize: 11, padding: '2px 8px' }}
              onClick={handleCheckInOut}
              disabled={checkingIn}
            >
              {checkingIn ? '...' : statusIn ? 'Check out' : 'Check in'}
            </button>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="bg-light rounded p-3 h-100">
            <div className="text-muted small">Trainer</div>
            <div className="fs-5 fw-semibold">{user.trainer}</div>
            {user.trainer === 'Not assigned' && (
              <span
                className="text-danger"
                style={{ fontSize: 11, cursor: 'pointer' }}
                onClick={openTrainerPicker}
              >
                + Pick a trainer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Trainer picker modal ── */}
      {showTrainers && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center
             justify-content-center" style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1050 }}>
          <div className="bg-white rounded-3 p-4 shadow" style={{ width: '100%', maxWidth: 480 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Pick your trainer</h5>
              <button className="btn-close" onClick={() => setShowTrainers(false)} />
            </div>
            {loadingT ? (
              <div className="text-center py-3"><div className="spinner-border text-danger" /></div>
            ) : trainers.map(t => (
              <div key={t.id} className="d-flex align-items-center justify-content-between
                   p-3 mb-2 rounded border">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-danger text-white d-flex align-items-center
                       justify-content-center fw-bold"
                    style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ fontSize: 14 }}>{t.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{t.specialization}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {t.members_count} members
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" disabled={assigning}
                  onClick={() => assignTrainer(t)}>
                  {assigning ? '...' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Today's workout ── */}
      <div className="card border mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 text-uppercase text-muted"
              style={{ fontSize: 12, letterSpacing: '0.05em' }}>
              Today — {todayWorkout?.workout || 'Rest day'}
            </h6>
            <small className="text-muted">{done.length} / {WORKOUTS.length} done</small>
          </div>
          <div className="progress mb-3" style={{ height: 6 }}>
            <div className="progress-bar bg-danger"
              style={{ width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
          {todayWorkout?.workout === 'Rest day' ? (
            <p className="text-muted text-center py-2" style={{ fontSize: 14 }}>
              Today is a rest day — recover well! 💤
            </p>
          ) : (
            <div className="row g-2">
              {WORKOUTS.map((w, i) => {
                const isDone = done.includes(i);
                return (
                  <div className="col-12 col-sm-6" key={i}>
                    <div onClick={() => toggle(i)}
                      className={`d-flex justify-content-between align-items-center p-2
                        rounded border ${isDone ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{w.sets}</div>
                      </div>
                      <div className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 22, height: 22, flexShrink: 0,
                          background: isDone ? '#dc3545' : 'transparent',
                          border: isDone ? 'none' : '1.5px solid #ccc' }}>
                        {isDone && (
                          <svg width="10" height="8" viewBox="0 0 10 8">
                            <polyline points="1,4 4,7 9,1" fill="none"
                              stroke="white" strokeWidth="1.8" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {progress === 100 && (
            <div className="alert alert-success mt-3 mb-0 py-2 text-center"
              style={{ fontSize: 13 }}>
              Workout complete! Great job 💪
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly schedule ── */}
      <div className="card border mb-4">
        <div className="card-body">
          <h6 className="text-uppercase text-muted mb-3"
            style={{ fontSize: 12, letterSpacing: '0.05em' }}>
            Weekly schedule
          </h6>
          {fullSchedule.map((s, i) => (
            <div key={i} className="d-flex align-items-center gap-3 py-2"
              style={{ borderBottom: i < 6 ? '0.5px solid #eee' : 'none' }}>
              <span className={`badge ${
                s.status === 'today'    ? 'bg-danger'  :
                s.status === 'done'     ? 'bg-success' :
                'bg-secondary bg-opacity-25 text-secondary'}`}
                style={{ minWidth: 36 }}>
                {s.day}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{s.workout}</span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {s.status === 'today' ? 'today' :
                 s.status === 'done'  ? 'completed' : 'upcoming'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nutrition ── */}
      <div className="card border">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-uppercase text-muted mb-0"
              style={{ fontSize: 12, letterSpacing: '0.05em' }}>
              Today's nutrition
            </h6>
            <button className="btn btn-outline-danger btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => {
                setNutForm({
                  calories: nutrition.calories,
                  protein:  nutrition.protein,
                  fat:      nutrition.fat,
                });
                setShowNutrition(true);
              }}>
              + Log food
            </button>
          </div>
          <div className="row g-3 text-center">
            {[
              { label: 'Calories', val: nutrition.calories, target: CAL_TARGET, color: 'primary', unit: 'kcal' },
              { label: 'Protein',  val: nutrition.protein,  target: PRO_TARGET, color: 'success', unit: 'g'    },
              { label: 'Fat',      val: nutrition.fat,      target: FAT_TARGET, color: 'warning', unit: 'g'    },
            ].map(n => (
              <div className="col-4" key={n.label}>
                <div className="fw-semibold">{n.val}<span className="text-muted"
                  style={{ fontSize: 11 }}> / {n.target}{n.unit}</span></div>
                <div className="text-muted small mb-1">{n.label}</div>
                <div className="progress" style={{ height: 4 }}>
                  <div className={`progress-bar bg-${n.color}`}
                    style={{ width: `${pct(n.val, n.target)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nutrition log modal ── */}
      {showNutrition && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center
             justify-content-center" style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1050 }}>
          <div className="bg-white rounded-3 p-4 shadow" style={{ width: '100%', maxWidth: 400 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Log today's nutrition</h5>
              <button className="btn-close" onClick={() => setShowNutrition(false)} />
            </div>
            {[
              { label: 'Calories (kcal)', key: 'calories', placeholder: `Target: ${CAL_TARGET}` },
              { label: 'Protein (g)',     key: 'protein',  placeholder: `Target: ${PRO_TARGET}` },
              { label: 'Fat (g)',         key: 'fat',      placeholder: `Target: ${FAT_TARGET}` },
            ].map(f => (
              <div className="mb-3" key={f.key}>
                <label className="form-label small text-muted">{f.label}</label>
                <input type="number" className="form-control" min="0"
                  placeholder={f.placeholder}
                  value={nutForm[f.key]}
                  onChange={e => setNutForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-danger w-100" onClick={submitNutrition}>
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
}