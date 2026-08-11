export const roleRoutes: Record<string, string[]> = {
  "Operations Manager": [
    "/",
    "/patients",
    "/referrals",
    "/appointments",
    "/waiting-list",
    "/patient-flow",
    "/ai-insights",
    "/population",
    "/integrations",
    "/settings",
    "/copilot",
  ],
  Clinician: [
    "/",
    "/patients",
    "/referrals",
    "/appointments",
    "/waiting-list",
    "/patient-flow",
    "/copilot",
    "/ai-insights",
    "/settings",
  ],
  Nurse: [
    "/",
    "/patients",
    "/appointments",
    "/patient-flow",
    "/medication",
    "/copilot",
    "/settings",
  ],
  "Care Coordinator": [
    "/",
    "/patients",
    "/referrals",
    "/appointments",
    "/waiting-list",
    "/patient-flow",
    "/copilot",
    "/population",
    "/settings",
  ],
  "Safety Officer": [
    "/",
    "/patients",
    "/medication",
    "/safety-analytics",
    "/copilot",
    "/ai-insights",
    "/settings",
  ],
  Administrator: ["*"],
  Patient: ["/portal", "/settings"],
};
export const canAccess = (role: string, path: string) => {
  if (path.startsWith("/search")) return role !== "Patient";
  const allowed = roleRoutes[role] || ["/"];
  return (
    allowed.includes("*") ||
    allowed.some((r) =>
      r === "/" ? path === "/" : path === r || path.startsWith(`${r}/`),
    )
  );
};
export const can = (
  role: string,
  action:
    | "clinical-review"
    | "safety-review"
    | "operations"
    | "admin"
    | "manage-patients"
    | "archive-patient"
    | "schedule"
    | "report-safety"
    | "manage-flow",
) =>
  ({
    "clinical-review": ["Clinician", "Administrator"],
    "safety-review": ["Safety Officer", "Administrator"],
    operations: ["Operations Manager", "Care Coordinator", "Administrator"],
    admin: ["Administrator"],
    "manage-patients": ["Operations Manager", "Clinician", "Administrator"],
    "archive-patient": ["Administrator"],
    schedule: [
      "Operations Manager",
      "Care Coordinator",
      "Administrator",
      "Patient",
    ],
    "report-safety": ["Nurse", "Clinician", "Safety Officer", "Administrator"],
    "manage-flow": [
      "Operations Manager",
      "Care Coordinator",
      "Clinician",
      "Administrator",
    ],
  })[action].includes(role);
