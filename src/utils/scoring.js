const calculateMatchScore = (student, internship) => {
  if (!student.skills || !internship.requiredSkills) {
    return { skillScore: 0, fairnessBoost: 0, finalScore: 0 };
  }

  let skillScore = 0;
  let fairnessBoost = 0;

  internship.requiredSkills.forEach(req => {
    const found = student.skills.find(
      skill => skill.name.toLowerCase() === req.name.toLowerCase()
    );

    if (found && found.level >= req.minLevel) {
      skillScore += found.level * req.weight;
    } else {
      skillScore -= req.weight;
    }
  });

  if (student.cgpa < 7 && student.projects >= 2) {
    fairnessBoost = 5;
  }

  const finalScore = skillScore + fairnessBoost;

  return {
    skillScore,
    fairnessBoost,
    finalScore
  };
};

export default calculateMatchScore;