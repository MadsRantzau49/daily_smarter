export function scoreQuizAnswer(correctIndex: number, selectedIndex: number) {
  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex > 3
  ) {
    throw new Error("Invalid answer");
  }
  return selectedIndex === correctIndex;
}
