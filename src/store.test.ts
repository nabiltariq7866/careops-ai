import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";

describe("CareOps interconnected workflows", () => {
  beforeEach(() => useStore.getState().reset());
  it("approves a referral and creates a waiting-list entry", () => {
    const before = useStore.getState().waiting.length;
    useStore.getState().approveReferral("R-2408");
    const s = useStore.getState();
    expect(s.referrals.find((r) => r.id === "R-2408")?.status).toBe("Approved");
    expect(s.waiting.length).toBe(before + 1);
  });
  it("assigns an appointment and schedules the waiting entry", () => {
    const w = useStore.getState().waiting[0];
    useStore
      .getState()
      .assignAppointment(w.id, {
        id: "A-test",
        patientId: w.patientId,
        practitioner: "Dr Test",
        specialty: w.specialty,
        date: "2026-08-20",
        time: "10:00",
        location: "Clinic",
        type: "Review",
        status: "Scheduled",
      });
    expect(useStore.getState().waiting.find((x) => x.id === w.id)?.status).toBe(
      "Scheduled",
    );
    expect(
      useStore.getState().appointments.some((x) => x.id === "A-test"),
    ).toBe(true);
  });
  it("prevents practitioner appointment conflicts", () => {
    const a = useStore.getState().appointments[0];
    expect(useStore.getState().addAppointment({ ...a, id: "conflict" })).toBe(
      false,
    );
  });
  it("releases a bed after all blockers resolve and discharge", () => {
    const a = useStore.getState().admissions[0];
    a.blockers.forEach((b) => useStore.getState().resolveBlocker(a.id, b.id));
    useStore.getState().discharge(a.id);
    expect(useStore.getState().beds.find((b) => b.id === a.bedId)?.status).toBe(
      "Available",
    );
    expect(
      useStore.getState().patients.find((p) => p.id === a.patientId)?.status,
    ).toBe("Discharged");
  });
  it("persists portal forms and enforces safety-review roles", () => {
    const f = useStore.getState().forms[0];
    useStore.getState().completeForm(f.id);
    useStore.getState().reviewIncident("MI-302", "Closed");
    expect(
      useStore.getState().incidents.find((x) => x.id === "MI-302")?.status,
    ).toBe("Approved");
    useStore.getState().setRole("Safety Officer");
    useStore.getState().reviewIncident("MI-302", "Closed");
    expect(useStore.getState().forms.find((x) => x.id === f.id)?.status).toBe(
      "Completed",
    );
    expect(
      useStore.getState().incidents.find((x) => x.id === "MI-302")?.status,
    ).toBe("Closed");
  });
});
