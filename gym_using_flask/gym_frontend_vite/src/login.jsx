import { useState } from "react";
import axios from "axios";
import {Link} from "react-router-dom"
import { useNavigate } from "react-router-dom";
const API=import.meta.env.VITE_API_URL;
export default function Login(){
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const handle_navigation=useNavigate()
    const handle_login=async (e)=>{
       e.preventDefault();
    try{
    const res=await axios.post(`${API}/login`,{email,
        password, 
        },{withCredentials:true})       
        // send data to the server(flask) to check whether the data is accept or not
        console.log(res.data)
        if(res.data.success){
            alert(res.data.message);
            handle_navigation('/home')
        }
        else{
            alert(res.data.message);
        }
    }catch(err){
    console.log(err);
    console.log(err.response);
    console.log(err.message);

    alert("login failed");
}}
    return (
  <div
    style={{
      height: "100vh",
      width: "100vw",
      background:
        'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1400") center/cover no-repeat',
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ width: "100%", maxWidth: "400px" }}>

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

        <h4 className="text-center mb-4 fw-bold">
          Welcome back
        </h4>

        <form onSubmit={handle_login}>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-danger w-100">
            Login
          </button>

          <p className="mt-3 text-center">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>

        </form>
      </div>

    </div>
  </div>
);
}