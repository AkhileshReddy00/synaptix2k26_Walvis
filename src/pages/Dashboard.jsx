import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import StudentProfile from "../components/StudentProfile";
import StudentMatching from "../components/StudentMatching";
import Notifications from "../components/Notifications";
import StudentChatList from "../components/StudentChatList";
import Chat from "../components/Chat";
import InternshipForm from "../components/InternshipForm";
import RankingSystem from "../components/RankingSystem";

const DASHBOARD_SYMBOLS = [
  { char: "*", x: 8, y: 16, delay: "0s", duration: "6.2s" },
  { char: "{}", x: 19, y: 38, delay: "0.8s", duration: "7.1s" },
  { char: "<>", x: 30, y: 74, delay: "0.4s", duration: "6.8s" },
  { char: "#", x: 46, y: 22, delay: "1.2s", duration: "7.4s" },
  { char: "+", x: 59, y: 82, delay: "0.6s", duration: "6.5s" },
  { char: "%", x: 73, y: 21, delay: "1s", duration: "7.2s" },
  { char: "@", x: 84, y: 44, delay: "0.2s", duration: "6.7s" },
  { char: "~", x: 92, y: 69, delay: "1.4s", duration: "7.6s" }
];

function Dashboard() {
  const [role, setRole] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
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

  useEffect(() => {
    document.body.classList.add("dashboard-plain");
    return () => {
      document.body.classList.remove("dashboard-plain");
    };
  }, []);

  useEffect(() => {
    document.body.classList.remove("dashboard-recruiter-bg", "dashboard-student-bg");
    if (role === "recruiter") document.body.classList.add("dashboard-recruiter-bg");
    if (role === "student") document.body.classList.add("dashboard-student-bg");

    return () => {
      document.body.classList.remove("dashboard-recruiter-bg", "dashboard-student-bg");
    };
  }, [role]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!role) {
    return <div className="p-10 text-slate-200">Loading...</div>;
  }

  return (
    <div
      className={`relative overflow-hidden min-h-screen px-1 sm:px-2 pb-8 dashboard-theme ${
        role === "student" ? "dashboard-student" : "dashboard-recruiter"
      }`}
    >
      <div className="dashboard-symbol-layer" aria-hidden="true">
        {DASHBOARD_SYMBOLS.map((item, index) => (
          <span
            key={`${item.char}-${index}`}
            className="dashboard-symbol"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: item.delay,
              animationDuration: item.duration
            }}
          >
            {item.char}
          </span>
        ))}
      </div>
      <div className="premium-panel tone-amber rounded-3xl p-5 sm:p-7 mb-6 fade-in">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/90">
          Team Walvis
        </p>
        <h1 className="headline-display mt-2 text-2xl sm:text-4xl leading-tight">
          Skill-Based Explainable Internship Matching Platform
        </h1>
        <p className="text-slate-300 mt-2">
          {role === "student"
            ? "Student workspace with profile insights, recommendation intelligence, and real-time recruiter chat."
            : "Recruiter workspace for internship creation, candidate ranking, and real-time conversations."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          {role === "student" ? "Student Dashboard" : "Recruiter Dashboard"}
        </h2>
        <span className="premium-pill w-fit px-3 py-1 text-xs uppercase tracking-wider text-slate-100/90">
          Role: {role}
        </span>
        <button className="premium-btn-alt w-fit" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {role === "student" ? (
        <div className="student-dashboard-flow">
          <Notifications />
          <StudentProfile />
          <div className="premium-panel tone-indigo rounded-2xl p-5 mt-6 student-chat-panel">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Your Conversations</h3>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-1/3">
                <StudentChatList onSelectConversation={setActiveConversationId} />
              </div>
              <div className="flex-1">
                {activeConversationId ? (
                  <Chat conversationId={activeConversationId} />
                ) : (
                  <div className="premium-panel tone-teal rounded-xl p-5 text-slate-300">
                    Select a conversation to start chatting.
                  </div>
                )}
              </div>
            </div>
          </div>
          <StudentMatching />
        </div>
      ) : (
        <>
          <InternshipForm />
          <RankingSystem />
        </>
      )}

      <div className="mt-12 premium-panel tone-rose rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-amber-200">Team Walvis</h3>

        <p className="text-slate-300 mt-2 text-sm">
          Skill-Based Explainable Internship Matching Platform
        </p>

        <p className="text-slate-400 mt-3 text-xs">
          © {new Date().getFullYear()} Team Walvis. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

