import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE_FIELDS } from "../constants/firestoreFields";

function StudentProfile() {
  const [name, setName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState(1);
  const [skills, setSkills] = useState([]);
  const [cgpa, setCgpa] = useState("");
  const [projects, setProjects] = useState("");

  const addSkill = () => {
    if (!skillName) return;
    setSkills([...skills, { name: skillName, level }]);
    setSkillName("");
    setLevel(1);
  };

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "studentProfiles", user.uid),
      {
        name,
        email: user.email,
        cgpa: Number(cgpa),
        projects: Number(projects),
        skills,
        [FIRESTORE_FIELDS.UPDATED_AT]: new Date()
      },
      { merge: true }
    );

    alert("Profile Saved Successfully");
  };

  return (
    <div className="premium-panel tone-teal p-6 rounded-2xl animate-fadeIn space-y-4">
      <h2 className="headline-display text-2xl sm:text-3xl text-slate-100">
        Student Profile
      </h2>

      <input
        className="premium-input"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="premium-input flex-1"
          placeholder="Skill Name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />
        <select
          className="premium-input sm:w-36"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option className="text-slate-900" key={num} value={num}>{num}</option>
          ))}
        </select>
        <button className="premium-btn sm:w-28" onClick={addSkill}>
          Add
        </button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, index) => (
            <span key={index} className="premium-pill px-3 py-1 text-xs">
              {s?.name} - Level {s?.level}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="premium-input"
          placeholder="CGPA"
          value={cgpa}
          onChange={(e) => setCgpa(e.target.value)}
        />

        <input
          className="premium-input"
          placeholder="Number of Projects"
          value={projects}
          onChange={(e) => setProjects(e.target.value)}
        />
      </div>

      <button className="premium-btn w-full sm:w-auto" onClick={saveProfile}>
        Update Profile
      </button>
    </div>
  );
}

export default StudentProfile;

