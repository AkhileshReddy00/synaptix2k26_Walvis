import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent border-b pb-4 mb-6">
        Login
      </h1>

      <input
        className="p-2 mb-3 border rounded w-64"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="p-2 mb-3 border rounded w-64"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
        onClick={handleLogin}
      >
        Login
      </button>

      <p className="mt-4">
        Don't have account?{" "}
        <Link className="text-blue-600" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;