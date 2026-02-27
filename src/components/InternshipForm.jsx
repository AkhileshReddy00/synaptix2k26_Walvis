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
    if (requiredSkills.length === 0)
      return alert("Add at least one required skill");

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
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Create Internship</h2>

      <input
        className="border p-2 rounded w-full"
        placeholder="Internship Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Skill Name"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>
              Weight {num}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={minLevel}
          onChange={(e) => setMinLevel(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>
              Min {num}
            </option>
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
        {requiredSkills.map((s, index) => (
          <div key={index} className="text-sm">
            {s.name} | Weight {s.weight} | Min {s.minLevel}
          </div>
        ))}
      </div>

      <button
        className="bg-green-600 text-white px-6 py-2 rounded"
        onClick={saveInternship}
      >
        Save Internship
      </button>
    </div>
  );
}

export default InternshipForm;