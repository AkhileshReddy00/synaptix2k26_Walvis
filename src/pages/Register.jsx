import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center fade-in">
      <div className="premium-panel tone-rose w-full max-w-xl rounded-3xl p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/90">
          New Account
        </p>
        <h1 className="headline-display mt-2 text-3xl sm:text-4xl leading-tight">
          Skill-Based Explainable Internship Matching Platform
        </h1>
        <p className="text-slate-300 mt-3 text-sm sm:text-base">
          Create your account and select your role to unlock tailored workflows.
        </p>

        <div className="mt-8 space-y-3">
          <input
            className="premium-input"
            type="email"
            placeholder="Work Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="premium-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="premium-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option className="text-slate-900" value="student">Student</option>
            <option className="text-slate-900" value="recruiter">Recruiter</option>
          </select>
        </div>

        <button className="premium-btn w-full mt-5" onClick={handleRegister}>
          Register
        </button>

        <p className="mt-5 text-sm text-slate-300">
          Already have an account?{" "}
          <Link className="text-amber-200 font-semibold hover:text-amber-100" to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
