export function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g., "2025-08-19"
}
