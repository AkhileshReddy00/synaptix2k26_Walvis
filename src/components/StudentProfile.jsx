import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function StudentProfile() {
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

    await setDoc(doc(db, "studentProfiles", user.uid), {
      skills,
      cgpa: Number(cgpa),
      projects: Number(projects),
    });

    alert("Profile Saved Successfully");
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Student Profile</h2>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Skill Name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {[1,2,3,4,5].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 rounded"
          onClick={addSkill}
        >
          Add
        </button>
      </div>

      <div>
        {skills && skills.length > 0 &&
          skills.map((s, index) => (
            <div key={index} className="text-sm">
              {s?.name} - Level {s?.level}
            </div>
          ))}
      </div>

      <input
        className="border p-2 rounded w-full"
        placeholder="CGPA"
        value={cgpa}
        onChange={(e) => setCgpa(e.target.value)}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Number of Projects"
        value={projects}
        onChange={(e) => setProjects(e.target.value)}
      />

      <button
        className="bg-green-600 text-white px-6 py-2 rounded"
        onClick={saveProfile}
      >
        Save Profile
      </button>
    </div>
  );
}

export default StudentProfile;