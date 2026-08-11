import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Search,
  ChevronRight,
  CalendarPlus,
  ClipboardPlus,
  Pencil,
  Archive,
  StickyNote,
} from "lucide-react";
import { useStore } from "../store";
import {
  Page,
  Card,
  Button,
  Badge,
  Modal,
  Field,
  initials,
  Empty,
  Select,
} from "../components";
import type { Patient } from "../types";
import { can } from "../permissions";

const age = (dob: string) =>
  new Date("2026-08-11").getFullYear() - new Date(dob).getFullYear();
const patientFields = (p?: Patient) => (
  <div className="formgrid">
    <Field label="First name">
      <input required name="firstName" defaultValue={p?.firstName} autoFocus />
    </Field>
    <Field label="Last name">
      <input required name="lastName" defaultValue={p?.lastName} />
    </Field>
    <Field label="Date of birth">
      <input
        required
        type="date"
        name="dob"
        max="2026-08-11"
        defaultValue={p?.dob}
      />
    </Field>
    <Field label="Sex">
      <Select name="sex" defaultValue={p?.sex}>
        <option>Female</option>
        <option>Male</option>
        <option>Non-binary</option>
        <option>Prefer not to say</option>
      </Select>
    </Field>
    <Field label="Phone">
      <input required name="phone" defaultValue={p?.phone} />
    </Field>
    <Field label="Email">
      <input required type="email" name="email" defaultValue={p?.email} />
    </Field>
    <Field label="Preferred language">
      <Select name="language" defaultValue={p?.language || "English"}>
        <option>English</option>
        <option>Spanish</option>
        <option>Urdu</option>
        <option>Arabic</option>
      </Select>
    </Field>
    <Field label="External / National ID">
      <input name="externalId" defaultValue={p?.externalId} />
    </Field>
    <Field label="Address">
      <input name="address" defaultValue={p?.address} />
    </Field>
    <Field label="Emergency contact name">
      <input name="emergencyName" defaultValue={p?.emergencyName} />
    </Field>
    <Field label="Emergency contact phone">
      <input name="emergencyPhone" defaultValue={p?.emergencyPhone} />
    </Field>
  </div>
);

export function Patients() {
  const store = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || ""),
    [status, setStatus] = useState("All"),
    [ward, setWard] = useState("All"),
    [open, setOpen] = useState(false),
    [dup, setDup] = useState<Patient>();
  const filtered = store.patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName} ${p.id}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (status === "All" || p.status === status) &&
      (ward === "All" || p.ward === ward),
  );
  const submit = (e: React.FormEvent<HTMLFormElement>, force = false) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      firstName = String(f.get("firstName")),
      lastName = String(f.get("lastName")),
      dob = String(f.get("dob")),
      phone = String(f.get("phone"));
    const match = store.patients.find(
      (p) =>
        p.dob === dob &&
        (p.phone === phone ||
          p.lastName.toLowerCase() === lastName.toLowerCase()),
    );
    if (match && !force) {
      setDup(match);
      return;
    }
    store.addPatient({
      firstName,
      lastName,
      dob,
      phone,
      email: String(f.get("email")),
      sex: String(f.get("sex")),
      language: String(f.get("language")),
      address: String(f.get("address")),
      externalId: String(f.get("externalId")),
      emergencyName: String(f.get("emergencyName")),
      emergencyPhone: String(f.get("emergencyPhone")),
      ward: "Outpatient",
      status: "Active",
      consent: {
        sms: f.has("sms"),
        email: f.has("emailConsent"),
        portal: f.has("portal"),
        dataSharing: f.has("dataSharing"),
      },
    });
    setOpen(false);
    setDup(undefined);
    toast.success(`${firstName} ${lastName} added`);
  };
  return (
    <Page
      title="Patients"
      subtitle={`${store.patients.length} synthetic patient records across the facility.`}
      action={
        can(store.role, "manage-patients") ? (
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Add Patient
          </Button>
        ) : undefined
      }
    >
      <Card>
        <div className="toolbar">
          <div className="search">
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or patient ID"
            />
          </div>
          <Select
            aria-label="Status filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Admitted</option>
            <option>Waiting</option>
            <option>Discharged</option>
          </Select>
          <Select
            aria-label="Ward filter"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          >
            <option>All</option>
            {[...new Set(store.patients.map((p) => p.ward))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </div>
        {filtered.length ? (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>DOB / Age</th>
                  <th>Contact</th>
                  <th>Current ward</th>
                  <th>Status</th>
                  <th>Last activity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person">
                        <span>{initials(p.firstName, p.lastName)}</span>
                        <b>
                          {p.firstName} {p.lastName}
                        </b>
                      </div>
                    </td>
                    <td className="mono">{p.id}</td>
                    <td>
                      {p.dob}
                      <small>{age(p.dob)} years</small>
                    </td>
                    <td>
                      {p.phone}
                      <small>{p.email}</small>
                    </td>
                    <td>{p.ward}</td>
                    <td>
                      <Badge
                        tone={
                          p.status === "Admitted"
                            ? "info"
                            : p.status === "Discharged"
                              ? ""
                              : "success"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td>{p.timeline[0]?.summary}</td>
                    <td>
                      <Link
                        aria-label={`View ${p.firstName}`}
                        to={`/patients/${p.id}`}
                      >
                        <ChevronRight />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No patients match the selected filters." />
        )}
      </Card>
      {open && (
        <Modal title="Add patient" onClose={() => setOpen(false)} wide>
          <form onSubmit={submit}>
            {patientFields()}
            <div className="consent">
              <h3>Communication consent</h3>
              <label>
                <input name="sms" type="checkbox" defaultChecked /> SMS
              </label>
              <label>
                <input name="emailConsent" type="checkbox" defaultChecked />{" "}
                Email
              </label>
              <label>
                <input name="portal" type="checkbox" defaultChecked /> Patient
                portal
              </label>
              <label>
                <input name="dataSharing" type="checkbox" /> Data sharing
              </label>
            </div>
            {dup && (
              <div className="duplicate">
                <b>Possible duplicate patient detected · 92% potential match</b>
                <p>
                  {dup.firstName} {dup.lastName} · {dup.dob} · {dup.phone}
                </p>
              </div>
            )}
            <div className="modalactions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              {dup ? (
                <>
                  <Link className="btn secondary" to={`/patients/${dup.id}`}>
                    Review existing
                  </Link>
                  <Button
                    type="button"
                    variant="warning"
                    onClick={() => {
                      const form = document.querySelector(
                        ".modal form",
                      ) as HTMLFormElement;
                      submit(
                        {
                          preventDefault() {},
                          currentTarget: form,
                        } as unknown as React.FormEvent<HTMLFormElement>,
                        true,
                      );
                    }}
                  >
                    Continue anyway
                  </Button>
                </>
              ) : (
                <Button>Add patient</Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const p = store.patients.find((x) => x.id === id);
  const [tab, setTab] = useState("Overview"),
    [modal, setModal] = useState<"edit" | "task" | "note" | null>(null);
  if (!p)
    return (
      <Page
        title="Patient not found"
        subtitle="The selected synthetic record is unavailable."
      >
        <Card>
          <Link to="/patients">Return to Patients</Link>
        </Card>
      </Page>
    );
  const aps = store.appointments.filter((x) => x.patientId === p.id),
    refs = store.referrals.filter((x) => x.patientId === p.id),
    tasks = store.tasks.filter((x) => x.patientId === p.id),
    docs = store.documents.filter((x) => x.patientId === p.id),
    notes = store.notes.filter((x) => x.patientId === p.id),
    incidents = store.incidents.filter((x) => x.patientId === p.id);
  const archive = () => {
    if (confirm(`Archive ${p.firstName} ${p.lastName}?`)) {
      store.archivePatient(p.id);
      toast.success("Patient archived");
      navigate("/patients");
    }
  };
  const tabBody = () => {
    if (tab === "Timeline")
      return (
        <div className="timeline">
          {p.timeline.map((x) => (
            <div key={x.id}>
              <i />
              <b>{x.summary}</b>
              <span>
                {x.type} · {x.source} · {new Date(x.at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    if (tab === "Appointments")
      return (
        <RecordTable
          rows={aps.map((x) => [
            `${x.date} · ${x.time}`,
            x.specialty,
            x.practitioner,
            x.status,
          ])}
        />
      );
    if (tab === "Referrals")
      return (
        <RecordTable
          rows={refs.map((x) => [x.id, x.service, x.urgency, x.status])}
        />
      );
    if (tab === "Medications")
      return (
        <RecordTable
          rows={incidents.map((x) => [
            x.medication,
            `${x.prescribed} → ${x.administered}`,
            x.type,
            x.status,
          ])}
        />
      );
    if (tab === "Documents")
      return (
        <RecordTable
          rows={docs.map((x) => [x.name, x.type, x.source, x.uploadedAt])}
        />
      );
    if (tab === "Tasks")
      return (
        <RecordTable
          rows={tasks.map((x) => [x.title, x.owner, x.due, x.status])}
        />
      );
    return null;
  };
  return (
    <Page
      title={`${p.firstName} ${p.lastName}`}
      subtitle={`${p.id} · ${p.sex} · ${age(p.dob)} years · ${p.ward}`}
      action={
        <div className="actions">
          <Button onClick={() => navigate(`/appointments?patient=${p.id}`)}>
            <CalendarPlus />
            Book appointment
          </Button>
          <Button variant="secondary" onClick={() => setModal("task")}>
            <ClipboardPlus />
            Add task
          </Button>
          <Button variant="secondary" onClick={() => setModal("note")}>
            <StickyNote />
            Add note
          </Button>
        </div>
      }
    >
      <div className="profilebanner">
        <div className="bigavatar">{initials(p.firstName, p.lastName)}</div>
        <div>
          <Badge tone="success">{p.status}</Badge>
          <p>Record updated {p.timeline[0]?.at.slice(0, 10)}</p>
        </div>
        <div className="actions profileactions">
          {can(store.role, "manage-patients") && (
            <Button variant="secondary" onClick={() => setModal("edit")}>
              <Pencil />
              Edit
            </Button>
          )}
          {can(store.role, "archive-patient") && (
            <Button variant="danger" onClick={archive}>
              <Archive />
              Archive
            </Button>
          )}
        </div>
      </div>
      <div className="tabs">
        {[
          "Overview",
          "Timeline",
          "Appointments",
          "Referrals",
          "Medications",
          "Documents",
          "Tasks",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <div className="grid thirds">
          <Card>
            <h2>Patient information</h2>
            <dl>
              <dt>Date of birth</dt>
              <dd>{p.dob}</dd>
              <dt>Language</dt>
              <dd>{p.language}</dd>
              <dt>Phone</dt>
              <dd>{p.phone}</dd>
              <dt>Email</dt>
              <dd>{p.email}</dd>
            </dl>
          </Card>
          <Card>
            <h2>Open work</h2>
            <dl>
              <dt>Appointments</dt>
              <dd>{aps.length}</dd>
              <dt>Referrals</dt>
              <dd>{refs.length}</dd>
              <dt>Tasks</dt>
              <dd>{tasks.filter((x) => x.status !== "Completed").length}</dd>
              <dt>Notes</dt>
              <dd>{notes.length}</dd>
            </dl>
          </Card>
          <div className="aibox">
            <div className="aititle">✦ AI Patient Summary</div>
            <p>
              {p.firstName} is {p.status.toLowerCase()} with {p.timeline.length}{" "}
              care events,{" "}
              {tasks.filter((x) => x.status !== "Completed").length} open tasks
              and {aps.length} appointments.
            </p>
            <small>AI-generated summary · Requires clinical review</small>
          </div>
        </div>
      ) : (
        <Card>
          <h2>{tab}</h2>
          {tabBody()}
        </Card>
      )}
      {modal && (
        <Modal
          title={
            modal === "edit"
              ? "Edit patient"
              : modal === "task"
                ? "Add task"
                : "Add note"
          }
          onClose={() => setModal(null)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (modal === "edit")
                store.updatePatient(p.id, {
                  firstName: String(f.get("firstName")),
                  lastName: String(f.get("lastName")),
                  dob: String(f.get("dob")),
                  sex: String(f.get("sex")),
                  phone: String(f.get("phone")),
                  email: String(f.get("email")),
                  language: String(f.get("language")),
                  address: String(f.get("address")),
                  externalId: String(f.get("externalId")),
                  emergencyName: String(f.get("emergencyName")),
                  emergencyPhone: String(f.get("emergencyPhone")),
                  consent: {
                    sms: f.has("sms"),
                    email: f.has("emailConsent"),
                    portal: f.has("portal"),
                    dataSharing: f.has("dataSharing"),
                  },
                });
              if (modal === "task")
                store.addTask({
                  id: crypto.randomUUID(),
                  patientId: p.id,
                  title: String(f.get("title")),
                  owner: String(f.get("owner")),
                  due: String(f.get("due")),
                  category: "Patient Care",
                  status: "Pending",
                });
              if (modal === "note") store.addNote(p.id, String(f.get("body")));
              toast.success(
                `${modal === "edit" ? "Patient" : "Record"} updated`,
              );
              setModal(null);
            }}
          >
            {modal === "edit" ? (
              <>
                {patientFields(p)}
                <div className="consent">
                  <h3>Consent & preferences</h3>
                  <label>
                    <input
                      name="sms"
                      type="checkbox"
                      defaultChecked={p.consent.sms}
                    />{" "}
                    SMS
                  </label>
                  <label>
                    <input
                      name="emailConsent"
                      type="checkbox"
                      defaultChecked={p.consent.email}
                    />{" "}
                    Email
                  </label>
                  <label>
                    <input
                      name="portal"
                      type="checkbox"
                      defaultChecked={p.consent.portal}
                    />{" "}
                    Patient portal
                  </label>
                  <label>
                    <input
                      name="dataSharing"
                      type="checkbox"
                      defaultChecked={p.consent.dataSharing}
                    />{" "}
                    Data sharing
                  </label>
                </div>
              </>
            ) : modal === "task" ? (
              <div className="formgrid">
                <Field label="Task">
                  <input required name="title" />
                </Field>
                <Field label="Owner">
                  <input
                    required
                    name="owner"
                    defaultValue="Care Coordination"
                  />
                </Field>
                <Field label="Due date">
                  <input
                    required
                    type="date"
                    name="due"
                    defaultValue="2026-08-14"
                  />
                </Field>
              </div>
            ) : (
              <Field label="Care note">
                <textarea required name="body" rows={6} />
              </Field>
            )}
            <div className="modalactions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button>Save</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
function RecordTable({ rows }: { rows: string[][] }) {
  return rows.length ? (
    <table>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((x, j) => (
              <td key={j}>{j === 0 ? <b>{x}</b> : x}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <Empty text="No records in this section." />
  );
}
