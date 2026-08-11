import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as seed from "./data";
import type {
  Patient,
  Referral,
  WaitEntry,
  Appointment,
  Bed,
  Admission,
  Incident,
  CareTask,
  PatientDocument,
  PatientMessage,
  PatientForm,
  Note,
  CorrectiveAction,
  AppNotification,
  IntegrationConnection,
  IntegrationEvent,
} from "./types";
type State = {
  patients: Patient[];
  referrals: Referral[];
  waiting: WaitEntry[];
  appointments: Appointment[];
  beds: Bed[];
  admissions: Admission[];
  incidents: Incident[];
  tasks: CareTask[];
  documents: PatientDocument[];
  messages: PatientMessage[];
  forms: PatientForm[];
  notes: Note[];
  correctiveActions: CorrectiveAction[];
  alerts: AppNotification[];
  integrations: IntegrationConnection[];
  integrationEvents: IntegrationEvent[];
  role: string;
  facility: string;
  addPatient: (p: Omit<Patient, "id" | "timeline">) => void;
  updatePatient: (id: string, p: Partial<Patient>) => void;
  archivePatient: (id: string) => void;
  addNote: (patientId: string, body: string) => void;
  addTask: (task: CareTask) => void;
  updateTask: (id: string, status: CareTask["status"]) => void;
  addReferral: (r: Referral) => void;
  updateReferral: (id: string, p: Partial<Referral>) => void;
  approveReferral: (id: string) => void;
  assignAppointment: (waitId: string, a: Appointment) => void;
  addAppointment: (a: Appointment) => boolean;
  updateAppointment: (id: string, p: Partial<Appointment>) => boolean;
  resolveBlocker: (
    admissionId: string,
    blockerId: string,
    status?: Admission["blockers"][number]["status"],
  ) => void;
  discharge: (id: string) => void;
  updateBed: (id: string, status: Bed["status"]) => void;
  addIncident: (i: Incident) => void;
  reviewIncident: (id: string, status?: Incident["status"]) => void;
  addCorrectiveAction: (a: CorrectiveAction) => void;
  updateCorrectiveAction: (id: string, p: Partial<CorrectiveAction>) => boolean;
  updateIntegration: (
    id: string,
    status: IntegrationConnection["status"],
  ) => boolean;
  addDocument: (d: PatientDocument) => void;
  addMessage: (m: PatientMessage) => void;
  completeForm: (id: string) => void;
  setRole: (role: string) => void;
  setFacility: (facility: string) => void;
  markAlertsRead: () => void;
  reset: () => void;
};
const initial = () => ({
  patients: structuredClone(seed.patients),
  referrals: structuredClone(seed.referrals),
  waiting: structuredClone(seed.waiting),
  appointments: structuredClone(seed.appointments),
  beds: structuredClone(seed.beds),
  admissions: structuredClone(seed.admissions),
  incidents: structuredClone(seed.incidents),
  tasks: [
    {
      id: "T-101",
      patientId: "P-10024",
      title: "Confirm discharge transport",
      owner: "Care Coordination",
      due: "2026-08-12",
      status: "Pending",
      category: "Discharge",
    },
  ] as CareTask[],
  documents: [
    {
      id: "D-1",
      patientId: "P-10024",
      name: "Cardiology Note.pdf",
      type: "Clinical Note",
      uploadedAt: "2026-08-10",
      source: "Care Team",
    },
  ] as PatientDocument[],
  messages: [
    {
      id: "M-1",
      patientId: "P-10045",
      sender: "Care Team",
      body: "Please complete your pre-appointment form.",
      at: "2026-08-11T09:00:00",
    },
  ] as PatientMessage[],
  forms: seed.patients.flatMap((p) =>
    ["Pre-appointment Form", "Medical History", "Consent Form"].map(
      (name, i) =>
        ({
          id: `F-${p.id}-${i}`,
          patientId: p.id,
          name,
          status: i === 1 ? "Completed" : "Not Started",
        }) as PatientForm,
    ),
  ),
  notes: [] as Note[],
  correctiveActions: [] as CorrectiveAction[],
  alerts: [
    {
      id: "N-1",
      title: "Urgent referral",
      body: "Neurology referral requires review",
      at: "2 min ago",
      read: false,
      href: "/referrals",
    },
    {
      id: "N-2",
      title: "Discharge at risk",
      body: "Ward 4B blockers remain open",
      at: "8 min ago",
      read: false,
      href: "/patient-flow",
    },
    {
      id: "N-3",
      title: "Safety review",
      body: "Medication incident awaits review",
      at: "15 min ago",
      read: false,
      href: "/medication",
    },
  ] as AppNotification[],
  integrations: [
    ["epic", "Epic", "Demo Connector", "Connected"],
    ["oracle", "Oracle Health", "Simulated Integration", "Syncing"],
    ["dedalus", "Dedalus", "Integration Ready", "Disconnected"],
    ["lab", "Laboratory System", "Demo Connector", "Connected"],
    ["pacs", "Imaging / PACS", "Demo Connector", "Attention Required"],
    ["pharmacy", "Pharmacy", "Simulated Integration", "Connected"],
    ["insurance", "Insurance", "Integration Ready", "Disconnected"],
    ["devices", "Medical Devices", "Integration Ready", "Disconnected"],
  ].map(([id, name, kind, status]) => ({
    id,
    name,
    kind,
    status: status as IntegrationConnection["status"],
    lastSync: "2026-08-11T14:30:00",
  })),
  integrationEvents: [
    "Patient.updated",
    "Referral.received",
    "Appointment.cancelled",
    "Encounter.started",
    "Observation.created",
    "Task.completed",
    "Patient.discharged",
  ].map((type, i) => ({
    id: `IE-${i}`,
    type,
    source: i % 2 ? "CareOps Demo" : "Epic Demo",
    at: `2026-08-11T14:${30 - i}:00`,
    payload: "Synthetic integration event",
  })),
  role: "Operations Manager",
  facility: "St. Anne Medical Centre",
});
const event = (type: string, summary: string) => ({
  id: crypto.randomUUID(),
  at: new Date().toISOString(),
  type,
  summary,
  source: "Current user",
});
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      addPatient: (p) =>
        set((s) =>
          ["Operations Manager", "Administrator"].includes(s.role)
            ? {
                patients: [
                  ...s.patients,
                  {
                    ...p,
                    id: `P-${10000 + s.patients.length * 11}`,
                    timeline: [event("Registration", "Patient registered")],
                  },
                ],
              }
            : {},
        ),
      updatePatient: (id, p) =>
        set((s) =>
          [
            "Operations Manager",
            "Clinician",
            "Administrator",
            "Patient",
          ].includes(s.role)
            ? {
                patients: s.patients.map((x) =>
                  x.id === id ? { ...x, ...p } : x,
                ),
              }
            : {},
        ),
      archivePatient: (id) =>
        set((s) =>
          s.role === "Administrator"
            ? {
                patients: s.patients.map((p) =>
                  p.id === id
                    ? {
                        ...p,
                        status: "Discharged",
                        ward: "Archived",
                        timeline: [
                          event("Archive", "Patient record archived"),
                          ...p.timeline,
                        ],
                      }
                    : p,
                ),
              }
            : {},
        ),
      addNote: (patientId, body) =>
        set((s) => ({
          notes: [
            {
              id: crypto.randomUUID(),
              patientId,
              body,
              author: "Maya Chen",
              at: new Date().toISOString(),
            },
            ...s.notes,
          ],
          patients: s.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  timeline: [event("Note", "Care note added"), ...p.timeline],
                }
              : p,
          ),
        })),
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
      updateTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      addReferral: (r) => set((s) => ({ referrals: [r, ...s.referrals] })),
      updateReferral: (id, p) =>
        set((s) => ({
          referrals: s.referrals.map((r) => (r.id === id ? { ...r, ...p } : r)),
        })),
      approveReferral: (id) =>
        set((s) => {
          if (
            ![
              "Operations Manager",
              "Care Coordinator",
              "Clinician",
              "Administrator",
            ].includes(s.role)
          )
            return s;
          const r = s.referrals.find((x) => x.id === id);
          if (!r) return s;
          return {
            referrals: s.referrals.map((x) =>
              x.id === id ? { ...x, status: "Approved" } : x,
            ),
            waiting: s.waiting.some((x) => x.patientId === r.patientId)
              ? s.waiting
              : [
                  ...s.waiting,
                  {
                    id: `W-${500 + s.waiting.length + 1}`,
                    patientId: r.patientId,
                    specialty: r.suggested,
                    priority: r.urgency,
                    since: new Date().toISOString().slice(0, 10),
                    risk: r.urgency === "Critical" ? "High" : "Medium",
                    status: "Waiting",
                  },
                ],
            patients: s.patients.map((p) =>
              p.id === r.patientId
                ? {
                    ...p,
                    status: "Waiting",
                    timeline: [
                      event(
                        "Referral",
                        "Referral approved and added to waiting list",
                      ),
                      ...p.timeline,
                    ],
                  }
                : p,
            ),
          } as Partial<State>;
        }),
      assignAppointment: (waitId, a) =>
        set((s) => ({
          appointments: [a, ...s.appointments],
          waiting: s.waiting.map((w) =>
            w.id === waitId ? { ...w, status: "Scheduled" } : w,
          ),
          patients: s.patients.map((p) =>
            p.id === a.patientId
              ? {
                  ...p,
                  timeline: [
                    event(
                      "Appointment",
                      `Appointment booked for ${a.date} at ${a.time}`,
                    ),
                    ...p.timeline,
                  ],
                }
              : p,
          ),
        })),
      addAppointment: (a) => {
        if (
          get().appointments.some(
            (x) =>
              x.practitioner === a.practitioner &&
              x.date === a.date &&
              x.time === a.time &&
              x.status !== "Cancelled",
          )
        )
          return false;
        set((s) => ({ appointments: [a, ...s.appointments] }));
        return true;
      },
      updateAppointment: (id, p) => {
        const old = get().appointments.find((x) => x.id === id);
        if (
          old &&
          get().appointments.some(
            (x) =>
              x.id !== id &&
              x.practitioner === (p.practitioner || old.practitioner) &&
              x.date === (p.date || old.date) &&
              x.time === (p.time || old.time) &&
              x.status !== "Cancelled",
          )
        )
          return false;
        set((s) => ({
          appointments: s.appointments.map((x) =>
            x.id === id ? { ...x, ...p } : x,
          ),
        }));
        return true;
      },
      resolveBlocker: (aid, bid, status = "Complete") =>
        set((s) => ({
          admissions: s.admissions.map((a) =>
            a.id === aid
              ? {
                  ...a,
                  blockers: a.blockers.map((b) =>
                    b.id === bid ? { ...b, status } : b,
                  ),
                }
              : a,
          ),
        })),
      discharge: (id) =>
        set((s) => {
          if (
            ![
              "Operations Manager",
              "Care Coordinator",
              "Clinician",
              "Administrator",
            ].includes(s.role)
          )
            return s;
          const a = s.admissions.find((x) => x.id === id);
          if (!a) return s;
          return {
            admissions: s.admissions.map((x) =>
              x.id === id ? { ...x, status: "Discharged" } : x,
            ),
            beds: s.beds.map((b) =>
              b.id === a.bedId
                ? { ...b, status: "Available", patientId: undefined }
                : b,
            ),
            patients: s.patients.map((p) =>
              p.id === a.patientId
                ? {
                    ...p,
                    status: "Discharged",
                    ward: "Home",
                    timeline: [
                      event("Discharge", "Patient discharged; bed released"),
                      ...p.timeline,
                    ],
                  }
                : p,
            ),
          } as Partial<State>;
        }),
      updateBed: (id, status) =>
        set((s) =>
          ["Operations Manager", "Administrator"].includes(s.role)
            ? { beds: s.beds.map((b) => (b.id === id ? { ...b, status } : b)) }
            : {},
        ),
      addIncident: (i) =>
        set((s) =>
          ["Nurse", "Safety Officer", "Clinician", "Administrator"].includes(
            s.role,
          )
            ? { incidents: [i, ...s.incidents] }
            : {},
        ),
      reviewIncident: (id, status = "Approved") =>
        set((s) =>
          ["Safety Officer", "Administrator"].includes(s.role)
            ? {
                incidents: s.incidents.map((i) =>
                  i.id === id ? { ...i, status } : i,
                ),
              }
            : {},
        ),
      addCorrectiveAction: (a) =>
        set((s) =>
          ["Safety Officer", "Administrator"].includes(s.role)
            ? { correctiveActions: [a, ...s.correctiveActions] }
            : {},
        ),
      updateCorrectiveAction: (id, p) => {
        if (!["Safety Officer", "Administrator"].includes(get().role))
          return false;
        set((s) => ({
          correctiveActions: s.correctiveActions.map((a) =>
            a.id === id ? { ...a, ...p } : a,
          ),
        }));
        return true;
      },
      updateIntegration: (id, status) => {
        if (get().role !== "Administrator") return false;
        set((s) => ({
          integrations: s.integrations.map((x) =>
            x.id === id
              ? { ...x, status, lastSync: new Date().toISOString() }
              : x,
          ),
          integrationEvents: [
            {
              id: crypto.randomUUID(),
              type: `Integration.${status}`,
              source: id,
              at: new Date().toISOString(),
              payload: "Demo connector state changed",
            },
            ...s.integrationEvents,
          ],
        }));
        return true;
      },
      addDocument: (d) => set((s) => ({ documents: [d, ...s.documents] })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      completeForm: (id) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: "Completed",
                  completedAt: new Date().toISOString(),
                }
              : f,
          ),
        })),
      setRole: (role) => set({ role }),
      setFacility: (facility) => set({ facility }),
      markAlertsRead: () =>
        set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
      reset: () => set(initial()),
    }),
    { name: "careops-demo-v1" },
  ),
);
export const patientName = (id: string) => {
  const p = useStore.getState().patients.find((x) => x.id === id);
  return p ? `${p.firstName} ${p.lastName}` : "Unknown patient";
};
