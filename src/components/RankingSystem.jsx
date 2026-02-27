import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";
import { TrendingUp } from "lucide-react";
import Chat from "./Chat";
import RecruiterChatList from "./RecruiterChatList";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

const toSafeIdPart = (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
const buildConversationId = (recruiterId, studentId, internshipId) =>
  `conv_${toSafeIdPart(recruiterId)}_${toSafeIdPart(studentId)}_${toSafeIdPart(internshipId)}`;

function RankingSystem() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const internshipSnap = await getDocs(collection(db, "internships"));
      const studentSnap = await getDocs(collection(db, "studentProfiles"));

      setInternships(
        internshipSnap.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }))
      );

      setStudents(
        studentSnap.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }))
      );
    };

    fetchData();
  }, []);

  const generateRanking = () => {
    if (!selectedInternship) return;

    const maxPossibleScore =
      selectedInternship.requiredSkills?.reduce(
        (acc, skill) => acc + skill.weight * 5,
        0
      ) || 1;

    const results = students.map(student => {
      const scoreData = calculateMatchScore(student, selectedInternship);

      const percentage = Math.max(
        0,
        ((scoreData.finalScore / maxPossibleScore) * 100).toFixed(1)
      );

      const fullyMatched = scoreData.gaps?.length === 0;

      return {
        ...student,
        ...scoreData,
        percentage,
        fullyMatched
      };
    });

    results.sort((a, b) => b.finalScore - a.finalScore);
    setRanking(results);

    const avgScore =
      results.reduce((acc, studentItem) => acc + Number(studentItem.percentage), 0) /
      results.length;

    const highest = results[0]?.percentage || 0;

    setAnalytics({
      average: avgScore.toFixed(1),
      highest
    });
  };

  const shortlistStudent = async (student) => {
    if (!selectedInternship) return;

    await addDoc(collection(db, "shortlists"), {
      recruiterId: auth.currentUser.uid,
      studentId: student.id,
      internshipId: selectedInternship.id,
      status: "shortlisted",
      createdAt: new Date()
    });

    setShortlistedIds([...shortlistedIds, student.id]);
    alert("Candidate shortlisted");
  };

  const openOrCreateConversation = async (student) => {
    if (!selectedInternship) {
      alert("Please select an internship first");
      return;
    }

    try {
      const recruiterId = auth.currentUser.uid;
      const conversationId = buildConversationId(
        recruiterId,
        student.id,
        selectedInternship.id
      );
      const conversationRef = doc(db, "conversations", conversationId);
      const existingConversation = await getDoc(conversationRef);

      if (!existingConversation.exists()) {
        await setDoc(conversationRef, {
          recruiterId,
          studentId: student.id,
          internshipId: selectedInternship.id,
          lastMessage: "",
          [FIRESTORE_FIELDS.UPDATED_AT]: serverTimestamp()
        });
      }

      setActiveConversationId(conversationId);
    } catch (err) {
      console.error("Error managing conversation:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="premium-panel tone-teal p-6 rounded-2xl animate-fadeIn mt-6 space-y-4">
      <h2 className="headline-display text-2xl sm:text-3xl text-slate-100">
        Candidate Ranking Intelligence
      </h2>

      <p className="text-sm text-slate-300">
        Weighted skill-fit model with explainable match signals and profile-level gaps.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          className="premium-input"
          onChange={(e) => setSelectedInternship(internships.find(i => i.id === e.target.value))}
        >
          <option className="text-slate-900" value="">Select Internship</option>
          {internships.map(internship => (
            <option className="text-slate-900" key={internship.id} value={internship.id}>
              {internship.title}
            </option>
          ))}
        </select>

        <button className="premium-btn sm:w-56" onClick={generateRanking}>
          Generate Ranking
        </button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="premium-panel tone-indigo rounded-xl p-4 text-center">
            <p className="text-slate-300 text-sm">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-100">{ranking.length}</p>
          </div>

          <div className="premium-panel tone-amber rounded-xl p-4 text-center">
            <p className="text-slate-300 text-sm">Average Match</p>
            <p className="text-2xl font-bold text-amber-200">{analytics?.average}%</p>
          </div>

          <div className="premium-panel tone-teal rounded-xl p-4 text-center">
            <p className="text-slate-300 text-sm">Top Candidate</p>
            <p className="text-2xl font-bold text-teal-200">{analytics?.highest}%</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-3">
        {ranking.length === 0 && (
          <p className="text-slate-300">No ranking generated yet.</p>
        )}

        {ranking.map((student, index) => (
          <div
            key={student.id}
            className={`p-5 rounded-2xl ${
              index === 0 ? "list-card-alt top-highlight-card" : "list-card"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {student.name || "Unnamed Student"}
                </h3>

                <p className="text-sm text-slate-300">{student.email}</p>

                <p className="text-sm text-slate-300 mt-1">
                  CGPA: {student.cgpa} | Projects: {student.projects}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {student.skills?.map((skill, idx) => (
                    <span key={idx} className="premium-pill text-xs px-2 py-1">
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-3xl font-bold text-amber-200 flex items-center lg:justify-end gap-1">
                  <TrendingUp className="w-5 h-5" /> {student.percentage}%
                </p>

                {student.fullyMatched && (
                  <span className="premium-pill inline-block mt-1 px-2 py-1 text-xs">
                    Meets all requirements
                  </span>
                )}

                <p className="text-sm text-slate-300 mt-1">Score: {student.finalScore}</p>
              </div>
            </div>

            <div className="mt-4 text-sm space-y-1">
              {student.breakdown?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-200">
                  <span>{item.skill}</span>
                  <span className={item.status === "Matched" ? "text-teal-200" : "text-rose-200"}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {shortlistedIds.includes(student.id) ? (
                <span className="premium-pill px-3 py-1 text-sm">Shortlisted</span>
              ) : (
                <button className="premium-btn" onClick={() => shortlistStudent(student)}>
                  Shortlist
                </button>
              )}

              <button
                className="premium-btn-alt"
                onClick={() => openOrCreateConversation(student)}
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/20">
        <h3 className="text-xl font-bold mb-4 text-slate-100">Conversations</h3>
        <div className="flex flex-col lg:flex-row gap-4">
          <RecruiterChatList onSelectConversation={setActiveConversationId} />
          <div className="flex-1">
            <Chat conversationId={activeConversationId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingSystem;

