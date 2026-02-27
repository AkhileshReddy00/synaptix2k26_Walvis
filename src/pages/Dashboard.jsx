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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!role) {
    return <div className="p-10 text-slate-200">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-1 sm:px-2 pb-8">
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
        <>
          <Notifications />
          <StudentProfile />
          <div className="premium-panel tone-indigo rounded-2xl p-5 mt-6">
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
        </>
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

