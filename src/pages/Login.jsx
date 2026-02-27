import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lampOn, setLampOn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center fade-in">
      <div className="premium-panel tone-indigo w-full max-w-xl rounded-3xl p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/90">
          Premium Access
        </p>
        <h1 className="headline-display mt-2 text-3xl sm:text-4xl leading-tight">
          Skill-Based Explainable Internship Matching Platform
        </h1>
        <p className="text-slate-300 mt-3 text-sm sm:text-base">
          Sign in to continue to your personalized student or recruiter workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="flex-1 space-y-3">
            <input
              className="premium-input"
              type="email"
              placeholder="Work Email"
              onFocus={() => setLampOn(true)}
              onChange={(e) => {
                setEmail(e.target.value);
                setLampOn(true);
              }}
            />

            <input
              className="premium-input"
              type="password"
              placeholder="Password"
              onFocus={() => setLampOn(false)}
              onChange={(e) => {
                setPassword(e.target.value);
                setLampOn(false);
              }}
            />
          </div>

          <div className={`auth-lamp mx-auto sm:mx-0 sm:mt-1 ${lampOn ? "on" : ""}`}>
            <div className="auth-lamp-head" />
            <div className="auth-lamp-neck" />
            <div className="auth-lamp-glow" />
          </div>
        </div>

        <button className="premium-btn w-full mt-5" onClick={handleLogin}>
          Login
        </button>

        <p className="mt-5 text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link className="text-amber-200 font-semibold hover:text-amber-100" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
