import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";

function StudentMatching() {
  const [internships, setInternships] = useState([]);
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const internshipSnap = await getDocs(collection(db, "internships"));
      const studentSnap = await getDocs(collection(db, "studentProfiles"));

      const internshipList = internshipSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const currentStudent = studentSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(s => s.id === auth.currentUser.uid);

      setInternships(internshipList);
      setStudent(currentStudent);

      if (currentStudent) {
        const scored = internshipList.map(internship => {
          const scoreData = calculateMatchScore(currentStudent, internship);

          const maxScore =
            internship.requiredSkills?.reduce(
              (acc, skill) => acc + skill.weight * 5,
              0
            ) || 1;

          const percentage = Math.max(
            0,
            ((scoreData.finalScore / maxScore) * 100).toFixed(1)
          );

          return {
            ...internship,
            percentage,
            gaps: scoreData.gaps
          };
        });

        scored.sort((a, b) => b.percentage - a.percentage);
        setResults(scored);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/40 transition duration-300 hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-blue-400 animate-fadeIn mt-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">
        Recommended Internships
      </h2>
      <p className="text-sm text-gray-500 mb-4">Top opportunities tailored for you.</p>

      {results.length === 0 && (
        <p className="text-gray-500">No internships available yet.</p>
      )}

      {results.map((item, index) => (
        <div
          key={item.id}
          className={`bg-white/80 backdrop-blur-lg border border-white/40 p-5 rounded-2xl mb-4 transition duration-300 hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-blue-400 animate-fadeIn ${
            index === 0
              ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 ring-2 ring-green-400 scale-105"
              : "bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight">
              {item.title}
            </h3>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {item.percentage}%
            </span>
          </div>

          {item.gaps?.length > 0 && (
            <div className="mt-3 text-sm text-red-600">
              <p className="font-semibold">Skill Gap:</p>
              {item.gaps.map((gap, i) => (
                <div key={i}>• {gap}</div>
              ))}
            </div>
          )}

          {index === 0 && (
            <div className="mt-2 text-sm text-green-700 font-semibold">
              ⭐ Top Recommendation
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StudentMatching;