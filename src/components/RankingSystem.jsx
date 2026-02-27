import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";

function RankingSystem() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [ranking, setRanking] = useState([]);

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
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-4 mt-6">
      <h2 className="text-xl font-semibold">Generate Ranking</h2>

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
        className="bg-blue-600 text-white px-6 py-2 rounded"
        onClick={generateRanking}
      >
        Generate Ranking
      </button>

      <div className="space-y-4 mt-4">
        {ranking.length === 0 && (
          <p className="text-gray-500">No ranking generated yet.</p>
        )}

        {ranking.map((student, index) => (
          <div
            key={student.id}
            className={`border p-4 rounded-xl shadow-sm ${
              index === 0
                ? "bg-green-50 border-green-400"
                : index === 1
                ? "bg-blue-50 border-blue-400"
                : index === 2
                ? "bg-yellow-50 border-yellow-400"
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
                <p className="text-xl font-bold text-green-600">
                  {student.percentage}%
                </p>
                <p className="text-sm text-gray-500">
                  Score: {student.finalScore}
                </p>
              </div>
            </div>

            {/* Breakdown Section */}
            <div className="mt-3 text-sm space-y-1">
              {student.breakdown?.map((b, i) => (
                <div key={i} className="flex justify-between">
                  <span>{b.skill}</span>
                  <span
                    className={
                      b.status === "Matched"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingSystem;