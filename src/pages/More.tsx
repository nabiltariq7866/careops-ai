import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  FileText,
  MessageSquare,
  Upload,
  Plug,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../store";
import {
  Page,
  Card,
  Button,
  Badge,
  AIBox,
  Modal,
  Field,
  Select,
} from "../components";
import { summarizeCohorts } from "../services/ai/populationHealthAI";

export function Population() {
  const s = useStore();
  const p = s.patients;
  const [risk, setRisk] = useState("All"),
    [department, setDepartment] = useState("All");
  const today = "2026-08-11";
  const overduePatients = p.filter(
    (patient) =>
      !s.appointments.some(
        (appointment) =>
          appointment.patientId === patient.id &&
          appointment.status !== "Cancelled" &&
          appointment.date >= today,
      ),
  );
  const cardiologyPatients = p.filter(
    (patient) =>
      s.referrals.some(
        (referral) =>
          referral.patientId === patient.id &&
          referral.service === "Cardiology",
      ) ||
      s.appointments.some(
        (appointment) =>
          appointment.patientId === patient.id &&
          appointment.specialty === "Cardiology",
      ),
  );
  const noShowPatients = p.filter((patient) =>
    s.appointments.some(
      (appointment) =>
        appointment.patientId === patient.id &&
        appointment.status === "No-show",
    ),
  );
  const careGaps =
    s.tasks.filter((task) => task.status !== "Completed").length +
    s.referrals.reduce((count, referral) => count + referral.missing.length, 0);
  const summary = summarizeCohorts({
    overdue: overduePatients.length,
    noShow: noShowPatients.length,
    careGaps,
  });
  const cohorts = [
    {
      name: "Patients without upcoming follow-up",
      patients: overduePatients.length,
      risk: "High",
      department: "General Medicine",
      contact: "No future appointment",
      action: "Outreach campaign",
    },
    {
      name: "Cardiology post-discharge",
      patients: cardiologyPatients.length,
      risk: "Medium",
      department: "Cardiology",
      contact: "Current shared records",
      action: "Book follow-up",
    },
    {
      name: "Repeated no-shows",
      patients: noShowPatients.length,
      risk: "High",
      department: "Neurology",
      contact: "Appointment history",
      action: "Confirm preferences",
    },
  ]
    .filter((cohort) => cohort.patients > 0)
    .filter(
      (x) =>
        (risk === "All" || x.risk === risk) &&
        (department === "All" || x.department === department),
    );
  return (
    <Page
      title="Population Health"
      subtitle="Synthetic cohort visibility for proactive operational follow-up."
    >
      <div className="filterbar">
        <Select value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
        </Select>
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option>All</option>
          <option>Cardiology</option>
          <option>Neurology</option>
          <option>General Medicine</option>
        </Select>
      </div>
      <div className="kpis">
        <Card className="kpi">
          <span>Overdue follow-up</span>
          <strong>{summary.overdue}</strong>
          <small>{overduePatients.length} require outreach review</small>
        </Card>
        <Card className="kpi">
          <span>High no-show cohort</span>
          <strong>{summary.noShow}</strong>
          <small>Risk signal only</small>
        </Card>
        <Card className="kpi">
          <span>Repeated admissions</span>
          <strong>
            {
              p.filter(
                (patient) =>
                  s.admissions.filter(
                    (admission) => admission.patientId === patient.id,
                  ).length > 1,
              ).length
            }
          </strong>
          <small>Last 90 days</small>
        </Card>
        <Card className="kpi">
          <span>Open care gaps</span>
          <strong>{summary.careGaps}</strong>
          <small>Tasks and missing referral items</small>
        </Card>
      </div>
      <AIBox>
        <h3>{summary.message}</h3>
        <p>
          Prioritize cohorts without contact in the last 60 days. This is an
          operational signal, not a clinical prediction.
        </p>
      </AIBox>
      <Card>
        <table>
          <thead>
            <tr>
              <th>Cohort</th>
              <th>Patients</th>
              <th>Risk</th>
              <th>Department</th>
              <th>Last contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((x) => (
              <tr key={x.name}>
                <td>
                  <b>{x.name}</b>
                </td>
                <td>{x.patients}</td>
                <td>
                  <Badge tone={x.risk === "High" ? "danger" : "warning"}>
                    {x.risk}
                  </Badge>
                </td>
                <td>{x.department}</td>
                <td>{x.contact}</td>
                <td>{x.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Page>
  );
}

export function Portal() {
  const s = useStore();
  const p = s.patients.find((x) => x.consent.portal) || s.patients[0];
  const appointments = s.appointments.filter(
    (x) => x.patientId === p.id && x.status !== "Cancelled",
  );
  const forms = s.forms.filter((x) => x.patientId === p.id),
    docs = s.documents.filter((x) => x.patientId === p.id),
    messages = s.messages.filter((x) => x.patientId === p.id);
  const [msg, setMsg] = useState(""),
    [booking, setBooking] = useState(false),
    [reschedule, setReschedule] = useState<string>();
  const saveAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      data = {
        date: String(f.get("date")),
        time: String(f.get("time")),
        specialty: String(f.get("specialty")),
        practitioner: "Dr Sarah Wilson",
        location: "Outpatient Clinic 2",
        type: "Patient Portal",
      };
    const ok = reschedule
      ? s.updateAppointment(reschedule, data)
      : s.addAppointment({
          id: crypto.randomUUID(),
          patientId: p.id,
          ...data,
          status: "Scheduled",
        });
    if (!ok) {
      toast.error("Appointment conflict");
      return;
    }
    setBooking(false);
    setReschedule(undefined);
    toast.success(
      reschedule ? "Appointment rescheduled" : "Appointment booked",
    );
  };
  return (
    <Page
      title={`Welcome, ${p.firstName}`}
      subtitle="Patient Portal · shared CareOps record"
      action={
        <Button onClick={() => setBooking(true)}>Book appointment</Button>
      }
    >
      <div className="portalhero">
        <div>
          <h2>Your care, in one place</h2>
          <p>Manage appointments, forms, documents and messages securely.</p>
        </div>
        <Badge tone="success">Portal active</Badge>
      </div>
      <Card>
        <div className="cardhead">
          <div>
            <h2>Profile, consent & preferences</h2>
            <p>Changes update the shared patient record.</p>
          </div>
        </div>
        <div className="formgrid">
          <Field label="Phone">
            <input
              value={p.phone}
              onChange={(e) => s.updatePatient(p.id, { phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              value={p.email}
              onChange={(e) => s.updatePatient(p.id, { email: e.target.value })}
            />
          </Field>
          <Field label="Preferred language">
            <Select
              value={p.language}
              onChange={(e) =>
                s.updatePatient(p.id, { language: e.target.value })
              }
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Urdu</option>
              <option>Arabic</option>
            </Select>
          </Field>
          <Field label="Address">
            <input
              value={p.address || ""}
              onChange={(e) =>
                s.updatePatient(p.id, { address: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="consent">
          <label>
            <input
              type="checkbox"
              checked={p.consent.sms}
              onChange={(e) =>
                s.updatePatient(p.id, {
                  consent: { ...p.consent, sms: e.target.checked },
                })
              }
            />{" "}
            SMS
          </label>
          <label>
            <input
              type="checkbox"
              checked={p.consent.email}
              onChange={(e) =>
                s.updatePatient(p.id, {
                  consent: { ...p.consent, email: e.target.checked },
                })
              }
            />{" "}
            Email
          </label>
          <label>
            <input
              type="checkbox"
              checked={p.consent.dataSharing || false}
              onChange={(e) =>
                s.updatePatient(p.id, {
                  consent: { ...p.consent, dataSharing: e.target.checked },
                })
              }
            />{" "}
            Data sharing
          </label>
        </div>
      </Card>
      <div className="grid thirds">
        <Card>
          <div className="portalcardtitle">
            <CalendarDays />
            <h2>Appointments</h2>
          </div>
          {appointments.map((ap) => (
            <div className="portalrow portalappointment" key={ap.id}>
              <span>
                <b>
                  {ap.date} · {ap.time}
                </b>
                <small>{ap.specialty}</small>
              </span>
              <div className="rowactions">
                <Button
                  variant="secondary"
                  onClick={() => setReschedule(ap.id)}
                >
                  Reschedule
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm("Cancel appointment?"))
                      s.updateAppointment(ap.id, { status: "Cancelled" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div className="portalcardtitle">
            <FileText />
            <h2>Forms</h2>
          </div>
          {forms.map((f) => (
            <div className="portalrow" key={f.id}>
              <span>{f.name}</span>
              {f.status === "Completed" ? (
                <Badge tone="success">Completed</Badge>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    s.completeForm(f.id);
                    toast.success(`${f.name} completed`);
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          ))}
        </Card>
        <Card>
          <div className="portalcardtitle">
            <Upload />
            <h2>Documents</h2>
          </div>
          {docs.map((d) => (
            <div className="portalrow">
              <span>
                {d.name}
                <small>{d.uploadedAt}</small>
              </span>
            </div>
          ))}
          <input
            aria-label="Upload document"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const allowedTypes = [
                "application/pdf",
                "image/png",
                "image/jpeg",
              ];
              if (!allowedTypes.includes(file.type)) {
                toast.error("Only PDF, PNG and JPEG files are supported");
                e.target.value = "";
                return;
              }
              if (file.size > 10 * 1024 * 1024) {
                toast.error("File exceeds 10 MB");
                e.target.value = "";
                return;
              }
              s.addDocument({
                id: crypto.randomUUID(),
                patientId: p.id,
                name: file.name,
                type: "Patient Upload",
                uploadedAt: new Date().toISOString().slice(0, 10),
                source: "Patient Portal",
                size: file.size,
                mimeType: file.type,
              });
              toast.success(`${file.name} uploaded`);
              e.target.value = "";
            }}
          />
        </Card>
      </div>
      <Card>
        <div className="portalcardtitle">
          <MessageSquare />
          <h2>Secure messages</h2>
        </div>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message ${m.sender === "Patient" ? "patientmsg" : ""}`}
          >
            <b>{m.sender}</b>
            <p>{m.body}</p>
            <small>{new Date(m.at).toLocaleString()}</small>
          </div>
        ))}
        <div className="composer">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Write a message…"
          />
          <Button
            onClick={() => {
              if (msg.trim()) {
                s.addMessage({
                  id: crypto.randomUUID(),
                  patientId: p.id,
                  sender: "Patient",
                  body: msg.trim(),
                  at: new Date().toISOString(),
                });
                setMsg("");
                toast.success("Message sent");
              }
            }}
          >
            Send
          </Button>
        </div>
      </Card>
      {(booking || reschedule) && (
        <Modal
          title={reschedule ? "Reschedule appointment" : "Book appointment"}
          onClose={() => {
            setBooking(false);
            setReschedule(undefined);
          }}
        >
          <form onSubmit={saveAppointment}>
            <Field label="Specialty">
              <Select name="specialty">
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Respiratory Medicine</option>
              </Select>
            </Field>
            <Field label="Date">
              <input
                required
                type="date"
                name="date"
                defaultValue="2026-08-18"
              />
            </Field>
            <Field label="Time">
              <input required type="time" name="time" defaultValue="10:30" />
            </Field>
            <div className="modalactions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setBooking(false);
                  setReschedule(undefined);
                }}
              >
                Cancel
              </Button>
              <Button>Save appointment</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

const resources: Record<string, object> = {
  Patient: {
    resourceType: "Patient",
    id: "P-10024",
    name: [{ family: "Sutton", given: ["James"] }],
    birthDate: "1968-03-04",
  },
  Appointment: {
    resourceType: "Appointment",
    id: "A-801",
    status: "booked",
    start: "2026-08-13T09:00:00Z",
  },
  Encounter: {
    resourceType: "Encounter",
    id: "E-114",
    status: "in-progress",
    subject: { reference: "Patient/P-10024" },
  },
  Observation: {
    resourceType: "Observation",
    id: "O-88",
    status: "final",
    code: { text: "Demo observation" },
  },
  Task: { resourceType: "Task", id: "T-101", status: "requested" },
  Practitioner: {
    resourceType: "Practitioner",
    id: "PR-14",
    name: [{ text: "Dr Sarah Wilson" }],
  },
  Condition: {
    resourceType: "Condition",
    id: "C-demo",
    clinicalStatus: { text: "Demo active" },
  },
  Medication: {
    resourceType: "Medication",
    id: "MED-demo",
    code: { text: "Synthetic medication" },
  },
  AllergyIntolerance: {
    resourceType: "AllergyIntolerance",
    id: "ALG-demo",
    clinicalStatus: { text: "active" },
  },
  DocumentReference: {
    resourceType: "DocumentReference",
    id: "D-1",
    status: "current",
  },
  CarePlan: { resourceType: "CarePlan", id: "CP-demo", status: "active" },
  Provenance: {
    resourceType: "Provenance",
    id: "PV-demo",
    recorded: "2026-08-11T14:30:00Z",
  },
};
export function Integrations() {
  const s = useStore();
  const [resource, setResource] = useState("Patient");
  const patient = s.patients[0];
  const appointment = s.appointments[0];
  const admission = s.admissions[0];
  const task = s.tasks[0];
  const incident = s.incidents[0];
  const document = s.documents[0];
  const latestSync = [...s.integrations]
    .map((integration) => integration.lastSync)
    .sort()
    .at(-1);
  const liveResources: Record<string, object> = {
    ...resources,
    Patient: patient
      ? {
          resourceType: "Patient",
          id: patient.id,
          identifier: [{ value: patient.externalId || patient.id }],
          name: [{ family: patient.lastName, given: [patient.firstName] }],
          birthDate: patient.dob,
          telecom: [{ system: "phone", value: patient.phone }],
        }
      : resources.Patient,
    Appointment: appointment
      ? {
          resourceType: "Appointment",
          id: appointment.id,
          status: appointment.status.toLowerCase().replace(" ", "-"),
          start: `${appointment.date}T${appointment.time}:00`,
          participant: [
            { actor: { reference: `Patient/${appointment.patientId}` } },
            { actor: { display: appointment.practitioner } },
          ],
        }
      : resources.Appointment,
    Encounter: admission
      ? {
          resourceType: "Encounter",
          id: admission.id,
          status: admission.status === "Active" ? "in-progress" : "finished",
          subject: { reference: `Patient/${admission.patientId}` },
          location: [
            { location: { display: `${admission.ward} / ${admission.bedId}` } },
          ],
        }
      : resources.Encounter,
    Task: task
      ? {
          resourceType: "Task",
          id: task.id,
          status:
            task.status === "Completed"
              ? "completed"
              : task.status === "In Progress"
                ? "in-progress"
                : "requested",
          description: task.title,
          for: { reference: `Patient/${task.patientId}` },
        }
      : resources.Task,
    Medication: incident
      ? {
          resourceType: "Medication",
          id: `MED-${incident.id}`,
          code: { text: incident.medication },
        }
      : resources.Medication,
    DocumentReference: document
      ? {
          resourceType: "DocumentReference",
          id: document.id,
          status: "current",
          subject: { reference: `Patient/${document.patientId}` },
          content: [
            {
              attachment: {
                title: document.name,
                contentType: document.mimeType,
              },
            },
          ],
        }
      : resources.DocumentReference,
    Provenance: {
      resourceType: "Provenance",
      id: "PV-demo",
      recorded: latestSync || new Date().toISOString(),
      agent: [{ who: { display: "CareOps simulated integration layer" } }],
    },
  };
  return (
    <Page
      title="Integrations"
      subtitle="Simulated interoperability visibility across external clinical systems."
    >
      <div className="notice">
        <AlertTriangle />
        Portfolio demo only. No live EHR, FHIR or hospital connections are
        active.
      </div>
      <Card>
        <div className="flowviz">
          <div>
            External EHRs<small>Epic · Oracle · Dedalus</small>
          </div>
          <i>→</i>
          <div>
            FHIR / HL7 / API<small>Interoperability layer</small>
          </div>
          <i>→</i>
          <div>
            CareOps AI<small>Operational workflows</small>
          </div>
        </div>
      </Card>
      <div className="integrationgrid">
        {s.integrations.map(
          ({ id, name: n, kind: t, status: st, lastSync }) => (
            <Card key={id}>
              <div className="integrationicon">
                <Plug />
              </div>
              <h3>{n}</h3>
              <p>{t}</p>
              <Badge
                tone={
                  st === "Connected"
                    ? "success"
                    : st === "Attention Required"
                      ? "warning"
                      : st === "Syncing"
                        ? "info"
                        : ""
                }
              >
                {st}
              </Badge>
              <small>
                Last simulated sync: {new Date(lastSync).toLocaleString()}
              </small>
              <Button
                variant="secondary"
                onClick={() => {
                  const ok = s.updateIntegration(
                    id,
                    st === "Connected" ? "Disconnected" : "Connected",
                  );
                  ok
                    ? toast.success(`${n} demo status updated`)
                    : toast.error("Administrator role required");
                }}
              >
                {st === "Connected" ? "Disconnect demo" : "Connect demo"}
              </Button>
            </Card>
          ),
        )}
      </div>
      <div className="grid two">
        <Card>
          <h2>FHIR Resource Explorer</h2>
          <div className="resources">
            {Object.keys(liveResources).map((x) => (
              <button
                key={x}
                className={resource === x ? "active" : ""}
                onClick={() => setResource(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <pre>{JSON.stringify(liveResources[resource], null, 2)}</pre>
        </Card>
        <Card>
          <h2>Integration event log</h2>
          {s.integrationEvents.map((event) => (
            <div className="eventlog" key={event.id}>
              <CheckCircle2 />
              <span>
                <b>{event.type}</b>
                <small>
                  {event.source} · {new Date(event.at).toLocaleString()}
                </small>
              </span>
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
}

export function SettingsPage() {
  const s = useStore();
  return (
    <Page
      title="Settings & Demo Controls"
      subtitle="Configure this local frontend simulation."
    >
      <div className="grid two">
        <Card>
          <h2>Demo environment</h2>
          <p>
            All records are fictional and stored only in this browser using
            localStorage.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Reset all demo data to its original state?")) {
                s.reset();
                toast.success("Demo data reset");
              }
            }}
          >
            <RefreshCw />
            Reset Demo Data
          </Button>
        </Card>
        <Card>
          <h2>Role simulation</h2>
          <label className="field">
            <span>Current role</span>
            <Select
              value={s.role}
              onChange={(e) => {
                s.setRole(e.target.value);
                toast.success(`Switched to ${e.target.value}`);
              }}
            >
              {[
                "Operations Manager",
                "Clinician",
                "Nurse",
                "Care Coordinator",
                "Safety Officer",
                "Administrator",
                "Patient",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </Select>
          </label>
          <p className="muted">
            Current role is persisted. Patient role emphasizes the portal;
            Safety Officer enables safety-review actions.
          </p>
        </Card>
      </div>
    </Page>
  );
}
