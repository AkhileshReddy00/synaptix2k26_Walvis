import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";

function RankingSystem() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [analytics, setAnalytics] = useState(null);

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

      return {
        ...student,
        ...scoreData,
        percentage
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

  const shortlistCandidate = async (student) => {
    if (!selectedInternship) return;

    await addDoc(collection(db, "shortlisted"), {
      recruiterId: auth.currentUser.uid,
      studentId: student.id,
      internshipId: selectedInternship.id,
      createdAt: new Date()
    });

    setShortlistedIds([...shortlistedIds, student.id]);
    alert("Candidate Shortlisted!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 mt-6">
      
      <h2 className="text-2xl font-bold">AI-Based Candidate Ranking</h2>

      <p className="text-sm text-gray-500">
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
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded"
        onClick={generateRanking}
      >
        Generate Ranking
      </button>

      {/* Summary Section */}
      {ranking.length > 0 && (
        <div className="bg-blue-50 p-4 rounded border border-blue-300">
          <p className="font-semibold">
            Total Applicants: {ranking.length}
          </p>
          <p>
            Top Match: {ranking[0]?.percentage}%
          </p>
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
          <div>
            <p className="text-sm text-gray-500">Applicants</p>
            <p className="text-xl font-bold">{ranking.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Match</p>
            <p className="text-xl font-bold">{analytics.average}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Top Score</p>
            <p className="text-xl font-bold text-green-600">
              {analytics.highest}%
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
            className={`border p-4 rounded-xl shadow-sm transition ${
              index === 0
                ? "bg-green-100 border-green-500 scale-105"
                : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Rank {index + 1}
                </h3>
                <p className="text-sm text-gray-600">
                  CGPA: {student.cgpa} | Projects: {student.projects}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">
                  {student.percentage}%
                </p>
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

            {/* Shortlist Action */}
            <div className="mt-4 flex justify-end">
              {shortlistedIds.includes(student.id) ? (
                <span className="text-green-700 font-semibold">Shortlisted ✓</span>
              ) : (
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-sm"
                  onClick={() => shortlistCandidate(student)}
                >
                  Shortlist
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingSystem;