import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import StudentProfile from "../components/StudentProfile";
import StudentMatching from "../components/StudentMatching";
import InternshipForm from "../components/InternshipForm";
import RankingSystem from "../components/RankingSystem";

function Dashboard() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!role) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-10">
      <h2>ROLE: {role}</h2>
      <div className="flex justify-between border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          {role === "student" ? "Student Dashboard" : "Recruiter Dashboard"}
        </h1>
        <button
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {role === "student" ? (
        <>
          <StudentProfile />
          <StudentMatching />
        </>
      ) : (
        <>
          <InternshipForm />
          <RankingSystem />
        </>
      )}
    </div>
  );
}

export default Dashboard;