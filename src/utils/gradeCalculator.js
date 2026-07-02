export const calculateGrade = (obtained, total) => {
  const percent = (obtained / total) * 100;
  if (percent >= 90) return 'A+';
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 60) return 'C';
  if (percent >= 50) return 'D';
  return 'F';
};

export const calculateAttendancePercent = (presentDays, totalDays) => {
  if (!totalDays) return 0;
  return Math.round((presentDays / totalDays) * 100);
};
