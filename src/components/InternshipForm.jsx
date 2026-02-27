import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function InternshipForm() {
  const [title, setTitle] = useState("");
  const [skillName, setSkillName] = useState("");
  const [weight, setWeight] = useState(1);
  const [minLevel, setMinLevel] = useState(1);
  const [requiredSkills, setRequiredSkills] = useState([]);

  const addSkill = () => {
    if (!skillName) return;

    setRequiredSkills([
      ...requiredSkills,
      { name: skillName, weight, minLevel }
    ]);

    setSkillName("");
    setWeight(1);
    setMinLevel(1);
  };

  const saveInternship = async () => {
    if (!title) return alert("Enter title");
    if (requiredSkills.length === 0) {
      return alert("Add at least one required skill");
    }

    await addDoc(collection(db, "internships"), {
      title,
      requiredSkills,
      createdBy: auth.currentUser.uid,
      createdAt: new Date()
    });

    alert("Internship Created");
    setTitle("");
    setRequiredSkills([]);
  };

  return (
    <div className="premium-panel tone-amber p-6 rounded-2xl animate-fadeIn space-y-4">
      <h2 className="headline-display text-2xl sm:text-3xl text-slate-100">
        Create Internship
      </h2>

      <input
        className="premium-input"
        placeholder="Internship Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-2">
        <input
          className="premium-input"
          placeholder="Skill Name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />

        <select
          className="premium-input"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option className="text-slate-900" key={num} value={num}>
              Weight {num}
            </option>
          ))}
        </select>

        <select
          className="premium-input"
          value={minLevel}
          onChange={(e) => setMinLevel(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option className="text-slate-900" key={num} value={num}>
              Min {num}
            </option>
          ))}
        </select>

        <button className="premium-btn" onClick={addSkill}>
          Add
        </button>
      </div>

      {requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((s, index) => (
            <span key={index} className="premium-pill px-3 py-1 text-xs">
              {s.name} | Weight {s.weight} | Min {s.minLevel}
            </span>
          ))}
        </div>
      )}

      <button className="premium-btn w-full sm:w-auto" onClick={saveInternship}>
        Save Internship
      </button>
    </div>
  );
}

export default InternshipForm;

