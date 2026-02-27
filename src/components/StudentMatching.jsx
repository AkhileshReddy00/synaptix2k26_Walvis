import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import calculateMatchScore from "../utils/scoring";
import { TrendingUp } from "lucide-react";

function StudentMatching() {
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

      if (!currentStudent) return;

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
    };

    fetchData();
  }, []);

  return (
    <div className="premium-panel tone-rose p-6 rounded-2xl animate-fadeIn mt-6">
      <h2 className="headline-display text-2xl sm:text-3xl text-slate-100 mb-1">
        Recommended Internships
      </h2>
      <p className="text-sm text-slate-300 mb-4">Top opportunities tailored for your profile.</p>

      {results.length === 0 && (
        <p className="text-slate-300">No internships available yet.</p>
      )}

      <div className="space-y-4">
        {results.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-2xl p-5 ${
              index === 0 ? "list-card-alt top-highlight-card" : "list-card"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center">
                {item.title}
                {index === 0 && (
                  <span className="ml-2 premium-pill px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Top Match
                  </span>
                )}
              </h3>
              <span className="text-3xl font-extrabold text-amber-200 flex items-center">
                <TrendingUp className="w-6 h-6 mr-1" /> {item.percentage}%
              </span>
            </div>

            {item.gaps?.length > 0 && (
              <div className="mt-3 text-sm text-rose-200">
                <p className="font-semibold">Skill Gap:</p>
                {item.gaps.map((gap, i) => (
                  <div key={i}>- {gap}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentMatching;

