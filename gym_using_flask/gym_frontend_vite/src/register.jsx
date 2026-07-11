import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ALL_DAYS = [
  { day: 'Mon', workout: 'Back & Biceps' },
  { day: 'Tue', workout: 'Legs' },
  { day: 'Wed', workout: 'Rest day' },
  { day: 'Thu', workout: 'Chest & Triceps' },
  { day: 'Fri', workout: 'Shoulders' },
  { day: 'Sat', workout: 'Arms' },
  { day: 'Sun', workout: 'Rest day' },
];
const API=import.meta.env.VITE_API_URL;

export default function Register() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const navigate = useNavigate();

  const toggleDay = (day) =>
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );

  const handleStep1 = (e) => {
    e.preventDefault();
    if (password !== confirm_password) {
      alert("Passwords don't match!");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      alert('Please select at least one workout day!');
      return;
    }
    try {
      const res = await axios.post(`${API}/register`, {
        username, email, password,
        days: selectedDays,
      });
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div
    style={{
      height: "100vh",
      width: "100vw",
      background:
        'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1400") center/cover no-repeat',
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
  }}
>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">

            <div className="card shadow-lg border-0 p-4">

              {/* Gym title */}
              <div className="text-center mb-2">
                <span
                  className="fw-bold text-danger"
                  style={{ fontSize: 13, letterSpacing: "0.1em" }}
                >
                  PROFESSIONAL PEAK GYM
                </span>
              </div>

              {/* step indicator */}
              <div className="d-flex justify-content-center gap-2 mb-4">
                {[1, 2].map(s => (
                  <div
                    key={s}
                    className={`rounded-circle d-flex align-items-center justify-content-center
                      ${step === s ? 'bg-danger text-white' : 'bg-light text-muted'}`}
                    style={{ width: 32, height: 32, fontSize: 13 }}
                  >
                    {s}
                  </div>
                ))}
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <h5 className="text-center mb-4">Create your account</h5>
                  <form onSubmit={handleStep1}>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input className="form-control" required
                        onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" required
                        onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" required
                        onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input type="password" className="form-control" required
                        onChange={e => setConfirmPassword(e.target.value)} />
                    </div>

                    <button className="btn btn-danger w-100">
                      Next →
                    </button>

                    <p className="mt-3 text-center">
                      Already have an account? <Link to="/login">Login</Link>
                    </p>
                  </form>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <h5 className="text-center mb-1">Pick your workout days</h5>
                  <p className="text-muted text-center small mb-4">
                    Select the days you plan to train
                  </p>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {ALL_DAYS.map(({ day, workout }) => {
                      const selected = selectedDays.includes(day);

                      return (
                        <div
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`d-flex align-items-center justify-content-between
                          p-3 rounded border
                          ${selected ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <span className="fw-semibold">{day}</span>
                            <span className="text-muted ms-2">
                              {workout}
                            </span>
                          </div>

                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 22,
                              height: 22,
                              background: selected ? '#dc3545' : 'transparent',
                              border: selected ? 'none' : '1.5px solid #ccc',
                            }}
                          >
                            {selected && "✓"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary w-50"
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>

                    <button
                      className="btn btn-danger w-50"
                      onClick={handleSubmit}
                      disabled={selectedDays.length === 0}
                    >
                      Register
                    </button>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}