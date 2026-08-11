import type { Admission } from "../../types";
export const predictDischargeDelay = (a: Admission) => {
  const blockers = a.blockers.filter(
    (x) => x.status === "Blocked" || x.status === "Pending",
  );
  return {
    risk: blockers.some((x) => x.status === "Blocked")
      ? "High"
      : blockers.length
        ? "Medium"
        : "Low",
    confidence: Math.min(94, 72 + blockers.length * 6),
    blockers: blockers.map((x) => x.name),
  } as const;
};
