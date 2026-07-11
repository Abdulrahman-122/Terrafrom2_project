import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const [profile,   setProfile]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);
  const fileRef = useRef();
  const navigate = useNavigate();
  const API=import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios.get(`${API}/profile`, { withCredentials: true })
      .then(res => setProfile(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(
        `${API}/profile/upload`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfile(prev => ({ ...prev, image_file: res.data.image_file }));
      setPreview(null);
      alert("Profile image updated!");
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger" />
    </div>
  );

  const initials   = profile.username.slice(0, 2).toUpperCase();
  const imageUrl   = preview
    ? preview
    : profile.image_file !== 'default.jpg'
      ? `${API}/static/profiles/${profile.image_file}`
      : null;

  return (
    <div className="container mt-5 pb-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">

          {/* back link */}
          <Link to="/home" className="text-muted small d-inline-flex align-items-center
            gap-1 mb-4 text-decoration-none">
            ← Back to dashboard
          </Link>

          <div className="card border shadow-sm">
            {/* gym banner */}
            <div className="rounded-top"
              style={{ height: 120, background: 'linear-gradient(135deg,#1a1a1a,#dc3545)' }} />

            <div className="card-body pt-0">
              {/* avatar */}
              <div className="d-flex justify-content-between align-items-end mb-3"
                style={{ marginTop: -40 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="profile"
                      style={{ width: 80, height: 80, borderRadius: '50%',
                               objectFit: 'cover', border: '3px solid white' }} />
                  ) : (
                    <div className="rounded-circle bg-danger text-white d-flex
                         align-items-center justify-content-center fw-bold"
                      style={{ width: 80, height: 80, fontSize: 28,
                               border: '3px solid white' }}>
                      {initials}
                    </div>
                  )}
                  {/* camera button */}
                  <button
                    onClick={() => fileRef.current.click()}
                    className="btn btn-sm btn-dark rounded-circle d-flex align-items-center
                               justify-content-center"
                    style={{ position: 'absolute', bottom: 0, right: 0,
                             width: 26, height: 26, padding: 0, fontSize: 12 }}
                    title="Change photo"
                  >
                    📷
                  </button>
                  <input ref={fileRef} type="file" accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange} />
                </div>

                {preview && (
                  <button className="btn btn-danger btn-sm" onClick={handleUpload}
                    disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Save photo'}
                  </button>
                )}
              </div>

              {/* name */}
              <h5 className="mb-0">{profile.username}</h5>
              <p className="text-muted small mb-3">{profile.email}</p>

              <hr />

              {/* info rows */}
              {[
                { label: 'Email',        value: profile.email      },
                { label: 'Member since', value: profile.join_date  },
                { label: 'Trainer',      value: profile.trainer    },
              ].map(row => (
                <div key={row.label}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{ borderBottom: '0.5px solid #eee' }}>
                  <span className="text-muted small">{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}