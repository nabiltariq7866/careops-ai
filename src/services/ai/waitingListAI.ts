import type { Appointment, WaitEntry } from "../../types";
import { simulate } from "./simulate";
export type Slot = Pick<
  Appointment,
  "practitioner" | "date" | "time" | "location"
> & { score: number; reason: string[] };
export const recommendAppointments = (
  entry: WaitEntry,
  appointments: Appointment[],
) => {
  const base = entry.priority === "Critical" ? 12 : 13;
  const candidates: Slot[] = [
    {
      practitioner: "Dr Sarah Wilson",
      date: `2026-08-${base}`,
      time: "10:30",
      location: `${entry.specialty} Clinic 2`,
      score: 96,
      reason: ["Earliest suitable slot", "Specialty and urgency match"],
    },
    {
      practitioner: "Dr Ishan Patel",
      date: "2026-08-14",
      time: "14:15",
      location: `${entry.specialty} Clinic 4`,
      score: 89,
      reason: ["Specialty match", "No patient conflict"],
    },
    {
      practitioner: "Dr Sarah Wilson",
      date: "2026-08-18",
      time: "09:30",
      location: `${entry.specialty} Clinic 2`,
      score: 84,
      reason: ["Patient morning preference"],
    },
  ].filter(
    (c) =>
      !appointments.some(
        (a) =>
          a.practitioner === c.practitioner &&
          a.date === c.date &&
          a.time === c.time &&
          a.status !== "Cancelled",
      ),
  );
  return simulate(candidates, 350);
};
