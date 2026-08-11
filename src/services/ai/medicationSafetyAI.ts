import type { Incident } from "../../types";
import { simulate } from "./simulate";
export const analyzeMedicationNarrative = (narrative: string) => {
  const doses = [...narrative.matchAll(/\b\d+(?:\.\d+)?\s?mg\b/gi)].map(
    (x) => x[0],
  );
  const time =
    narrative.match(/\b(?:[01]?\d|2[0-3])(?::\d{2})?\s?(?:AM|PM)?\b/i)?.[0] ||
    "Not stated";
  return simulate(
    {
      medication:
        narrative.match(/(?:given|received)\s+([A-Za-z]+)/i)?.[1] ||
        "Amlodipine",
      prescribed: doses[1] || doses[0] || "Not stated",
      administered: doses[0] || "Not stated",
      time,
      type: /rash|reaction|swelling/i.test(narrative)
        ? "Adverse Drug Reaction"
        : /instead|wrong|higher|double/i.test(narrative)
          ? "Wrong Dose"
          : "Medication Event",
      severity: /harm|hospital|severe/i.test(narrative)
        ? ("High" as const)
        : ("Moderate" as const),
      harm: /no immediate harm|no harm/i.test(narrative)
        ? "None observed"
        : "Requires review",
    },
    550,
  );
};
export const findSimilarIncidents = (incident: Incident, all: Incident[]) =>
  all.filter(
    (x) =>
      x.id !== incident.id &&
      (x.medication.toLowerCase() === incident.medication.toLowerCase() ||
        (x.ward === incident.ward && x.type === incident.type)),
  );
