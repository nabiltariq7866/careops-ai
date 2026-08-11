import { describe, it, expect } from "vitest";
import { analyzeReferral } from "./referralAI";
import { recommendAppointments } from "./waitingListAI";
import { analyzeMedicationNarrative } from "./medicationSafetyAI";
import { predictDischargeDelay } from "./dischargeAI";
import {
  patients,
  referrals,
  waiting,
  appointments,
  admissions,
} from "../../data";
describe("deterministic AI services", () => {
  it("returns grounded referral analysis", async () => {
    const x = await analyzeReferral(referrals[0], patients[1]);
    expect(x.patient).toContain("Amina");
    expect(x.specialty).toBe(referrals[0].service);
    expect(x.confidence).toBeGreaterThan(80);
  });
  it("excludes occupied slots", async () => {
    const x = await recommendAppointments(waiting[0], appointments);
    expect(
      x.every(
        (slot) =>
          !appointments.some(
            (a) =>
              a.practitioner === slot.practitioner &&
              a.date === slot.date &&
              a.time === slot.time,
          ),
      ),
    ).toBe(true);
  });
  it("extracts dose details", async () => {
    const x = await analyzeMedicationNarrative(
      "Patient was given 10mg instead of prescribed 5mg at 8 PM. No immediate harm observed.",
    );
    expect(x.administered).toBe("10mg");
    expect(x.prescribed).toBe("5mg");
    expect(x.type).toBe("Wrong Dose");
  });
  it("detects blocked discharge risk", () =>
    expect(predictDischargeDelay(admissions[0]).risk).toBe("High"));
});
