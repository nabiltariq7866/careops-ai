import type { Patient, Referral } from "../../types";
import { simulate } from "./simulate";
export type ReferralAnalysis = {
  patient: string;
  specialty: string;
  urgency: Referral["urgency"];
  confidence: number;
  reason: string;
  missing: string[];
  routing: string;
};
export const analyzeReferral = (referral: Referral, patient?: Patient) =>
  simulate<ReferralAnalysis>({
    patient: patient
      ? `${patient.firstName} ${patient.lastName}`
      : referral.patientId,
    specialty: referral.service || referral.suggested,
    urgency: referral.urgency,
    confidence: Math.min(98, 84 + (referral.service.length % 14)),
    reason: `Referral from ${referral.source} requests ${referral.service} assessment.`,
    missing: referral.missing,
    routing: `${referral.urgency === "Routine" ? "General" : "Rapid Access"} ${referral.service} Clinic`,
  });
