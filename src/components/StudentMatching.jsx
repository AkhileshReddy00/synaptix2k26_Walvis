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
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Recommended Internships
      </h2>

      {results.length === 0 && (
        <p className="text-gray-500">No internships available yet.</p>
      )}

      {results.map((item, index) => (
        <div
          key={item.id}
          className={`border p-5 rounded-xl mb-4 transition ${
            index === 0
              ? "bg-green-100 border-green-500 scale-105"
              : "bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              {item.title}
            </h3>
            <span className="text-green-700 font-bold text-xl">
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