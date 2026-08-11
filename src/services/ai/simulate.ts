export const simulate = async <T>(value: T, delay = 450, fail = false) => {
  await new Promise((r) => setTimeout(r, delay));
  if (fail) throw new Error("Simulated AI service unavailable");
  return value;
};
