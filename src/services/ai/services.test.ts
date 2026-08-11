import { describe, it, expect } from "vitest";
import { analyzeReferral } from "./referralAI";
import { recommendAppointments } from "./waitingListAI";
import { analyzeMedicationNarrative } from "./medicationSafetyAI";
import { predictDischargeDelay } from "./dischargeAI";
import { answerCopilotPrompt, detectCopilotIntent } from "./copilotAI";
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
    expect(x.time).toBe("8 PM");
  });
  it("does not mistake medication doses for event times", async () => {
    const x = await analyzeMedicationNarrative(
      "Patient received 10mg instead of prescribed 5mg. No immediate harm observed.",
    );
    expect(x.time).toBe("Not stated");
  });
  it("returns distinct deterministic Copilot responses by prompt intent", () => {
    const input = {
      context: "Admission",
      subject: "admission AD-91",
      summary: "Patient is active in Ward 4B.",
      outstanding: ["Resolve pharmacy blocker"],
      sources: ["Admission Record"],
    };
    const actions = answerCopilotPrompt({
      ...input,
      prompt: "What actions are outstanding?",
    });
    const letter = answerCopilotPrompt({
      ...input,
      prompt: "Draft a discharge letter",
    });
    expect(detectCopilotIntent("Draft patient communication")).toBe(
      "patient-communication",
    );
    expect(actions.intent).toBe("outstanding");
    expect(letter.intent).toBe("discharge-letter");
    expect(actions.body).not.toBe(letter.body);
    expect(letter.sources).toEqual(["Admission Record"]);
  });
  it("detects blocked discharge risk", () =>
    expect(predictDischargeDelay(admissions[0]).risk).toBe("High"));
});
