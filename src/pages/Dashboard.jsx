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
    <div className="min-h-screen p-10">
      <div className="mb-8 border-b pb-6 fade-in">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
          SkillMatch AI
        </h1>
        <p className="text-gray-500 mt-2">
          Intelligent Internship Matching with Explainable Ranking
        </p>
      </div>
      <h2>ROLE: {role}</h2>
      <div className="flex justify-between border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          {role === "student" ? "Student Dashboard" : "Recruiter Dashboard"}
        </h1>
        <button
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition duration-200"
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
      <div className="mt-16 pt-8 border-t border-gray-200 text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Team Walvis
        </h3>

        <p className="text-gray-500 mt-2 text-sm">
          Skill-Based Explainable Internship Matching Platform
        </p>

        <p className="text-gray-400 mt-3 text-xs">
          © {new Date().getFullYear()} Team Walvis. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;