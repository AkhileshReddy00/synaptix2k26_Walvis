import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";
import { Star, TrendingUp } from "lucide-react";
import Chat from "./Chat";
import RecruiterChatList from "./RecruiterChatList";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

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
        internshipSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      setStudents(
        studentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
      results.reduce((acc, s) => acc + Number(s.percentage), 0) /
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
    alert("Candidate Shortlisted!");
  };

  const openOrCreateConversation = async (student) => {
    if (!selectedInternship) {
      alert("Please select an internship first");
      return;
    }

    console.log("Opening/creating conversation with student:", student.id);

    // look for existing conversation
    const q = query(
      collection(db, "conversations"),
      where(FIRESTORE_FIELDS.RECRUITER_ID, "==", auth.currentUser.uid),
      where(FIRESTORE_FIELDS.STUDENT_ID, "==", student.id),
      where(FIRESTORE_FIELDS.INTERNSHIP_ID, "==", selectedInternship.id),
      orderBy(FIRESTORE_FIELDS.UPDATED_AT, "desc")
    );

    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        // conversation exists, open it
        console.log("Existing conversation found:", snap.docs[0].id);
        setActiveConversationId(snap.docs[0].id);
      } else {
        // create new conversation
        console.log("Creating new conversation...");
        const convoRef = await addDoc(collection(db, "conversations"), {
          recruiterId: auth.currentUser.uid,
          studentId: student.id,
          internshipId: selectedInternship.id,
          lastMessage: "",
          [FIRESTORE_FIELDS.UPDATED_AT]: serverTimestamp()
        });
        console.log("Conversation created:", convoRef.id);
        setActiveConversationId(convoRef.id);
      }
    } catch (err) {
      console.error("Error managing conversation:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 transition duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fadeIn space-y-4 mt-6">
      
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">
        AI-Based Candidate Ranking
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Ranking is based on weighted skill matching with fairness boost for strong project work.
      </p>

      <select
        className="border p-2 rounded w-full"
        onChange={(e) =>
          setSelectedInternship(
            internships.find(i => i.id === e.target.value)
          )
        }
      >
        <option value="">Select Internship</option>
        {internships.map(i => (
          <option key={i.id} value={i.id}>
            {i.title}
          </option>
        ))}
      </select>

      <button
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition duration-200"
        onClick={generateRanking}
      >
        Generate Ranking
      </button>

      {/* Animated Stats Section */}
      {analytics && (
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-md text-center fade-in">
            <p className="text-gray-500 text-sm">Total Applicants</p>
            <p className="text-2xl font-bold">{ranking.length}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-md text-center fade-in">
            <p className="text-gray-500 text-sm">Average Match</p>
            <p className="text-2xl font-bold">{analytics?.average}%</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-md text-center fade-in">
            <p className="text-gray-500 text-sm">Top Candidate</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics?.highest}%
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-4">
        {ranking.length === 0 && (
          <p className="text-gray-500">No ranking generated yet.</p>
        )}

        {ranking.map((student, index) => (
          <div
            key={student.id}
            className={`p-6 rounded-2xl shadow-xl transition duration-300 transform hover:scale-[1.02] fade-in ${
              index === 0
                ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-400 ring-2 ring-green-400"
                : "bg-white/70 backdrop-blur-xl border border-white/40"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {student.name || "Unnamed Student"}
                </h3>

                <p className="text-sm text-gray-500">
                  {student.email}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  CGPA: {student.cgpa} | Projects: {student.projects}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {student.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
  <p className="text-2xl font-bold text-green-600">
    {student.percentage}%
  </p>

  {student.fullyMatched && (
    <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
      Meets All Requirements
    </span>
  )}

  <p className="text-sm text-gray-500">
    Score: {student.finalScore}
  </p>
</div>
            </div>

            {/* Skill Breakdown */}
            <div className="mt-4 text-sm space-y-1">
              {student.breakdown?.map((b, i) => (
                <div key={i} className="flex justify-between">
                  <span>{b.skill}</span>
                  <span
                    className={
                      b.status === "Matched"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Shortlist + chat buttons */}
            <div className="mt-4 flex justify-end gap-2">
              {shortlistedIds.includes(student.id) ? (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent font-semibold">Shortlisted ✓</span>
              ) : (
                <button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition duration-200"
                  onClick={() => shortlistStudent(student)}
                >
                  Shortlist
                </button>
              )}

              <button
                className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition"
                onClick={() => openOrCreateConversation(student)}
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recruiter Chat Section */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-xl font-bold mb-4">Conversations</h3>
        <div className="flex gap-4">
          <RecruiterChatList onSelectConversation={setActiveConversationId} />
          <Chat conversationId={activeConversationId} />
        </div>
      </div>
    </div>
  );
}

export default RankingSystem;
