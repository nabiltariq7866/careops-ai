import { useState } from "react";
import { toast } from "sonner";
import { Plus, BedDouble } from "lucide-react";
import { useStore } from "../store";
import {
  Page,
  Card,
  Button,
  Badge,
  Modal,
  Field,
  AIBox,
  Empty,
} from "../components";
import type { Admission, Bed } from "../types";
import { predictDischargeDelay } from "../services/ai/dischargeAI";
import { can } from "../permissions";
export function PatientFlow() {
  const s = useStore();
  const manageFlow = can(s.role, "manage-flow");
  const [tab, setTab] = useState("Board"),
    [admit, setAdmit] = useState(false),
    [bedEdit, setBedEdit] = useState<Bed>();
  const name = (id: string) => {
    const p = s.patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  };
  const ready = (a: Admission) =>
    Math.round(
      (a.blockers.filter(
        (b) => b.status === "Complete" || b.status === "Not Required",
      ).length /
        a.blockers.length) *
        100,
    );
  const active = s.admissions.filter((a) => a.status === "Active");
  const discharge = (a: Admission) => {
    if (ready(a) < 100)
      return toast.error("Resolve all required dependencies first");
    s.discharge(a.id);
    toast.success(`Patient discharged; bed ${a.bedId} released`);
  };
  return (
    <Page
      title="Patient Flow"
      subtitle="Manage admissions, bed capacity, tasks and discharge readiness."
      action={
        manageFlow ? (
          <Button onClick={() => setAdmit(true)}>
            <Plus />
            Admit patient
          </Button>
        ) : undefined
      }
    >
      <div className="tabs">
        {["Board", "Beds", "Discharge", "Tasks"].map((x) => (
          <button
            key={x}
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {tab === "Beds" ? (
        <Card>
          <h2>Bed administration</h2>
          <div className="bedgrid">
            {s.beds.map((b) => (
              <button
                key={b.id}
                className={`bed ${b.status.toLowerCase()}`}
                onClick={() => manageFlow && setBedEdit(b)}
                disabled={!manageFlow}
              >
                <BedDouble />
                <b>{b.id}</b>
                <Badge
                  tone={
                    b.status === "Available"
                      ? "success"
                      : b.status === "Occupied"
                        ? "info"
                        : "warning"
                  }
                >
                  {b.status}
                </Badge>
                <small>{b.patientId ? name(b.patientId) : b.ward}</small>
              </button>
            ))}
          </div>
        </Card>
      ) : tab === "Tasks" ? (
        <Card>
          <h2>Operational Tasks</h2>
          {s.tasks.length ? (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Patient</th>
                  <th>Owner</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {s.tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <b>{t.title}</b>
                      <small>{t.category}</small>
                    </td>
                    <td>{name(t.patientId)}</td>
                    <td>{t.owner}</td>
                    <td>{t.due}</td>
                    <td>
                      <select
                        value={t.status}
                        disabled={!manageFlow}
                        onChange={(e) =>
                          s.updateTask(t.id, e.target.value as typeof t.status)
                        }
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty text="No open operational tasks." />
          )}
        </Card>
      ) : (
        <div className="flowboard">
          {active
            .filter((a) => tab === "Board" || tab === "Discharge")
            .map((a) => (
              <Card key={a.id}>
                <div className="flowhead">
                  <div>
                    <h2>{name(a.patientId)}</h2>
                    <p>
                      {a.patientId} · {a.ward} · Bed {a.bedId}
                    </p>
                  </div>
                  <Badge
                    tone={
                      ready(a) === 100
                        ? "success"
                        : a.blockers.some((b) => b.status === "Blocked")
                          ? "danger"
                          : "warning"
                    }
                  >
                    {ready(a) === 100 ? "Discharge Ready" : "At Risk"}
                  </Badge>
                </div>
                <div className="flowmeta">
                  <span>
                    Consultant<b>{a.consultant}</b>
                  </span>
                  <span>
                    Expected discharge<b>{a.expected}</b>
                  </span>
                  <span>
                    Readiness<b>{ready(a)}%</b>
                  </span>
                </div>
                <div className="readiness">
                  <i style={{ width: `${ready(a)}%` }} />
                </div>
                {tab === "Discharge" &&
                  a.blockers.some((b) => b.status !== "Complete") && (
                    <AIBox title="AI Delay Prediction">
                      <p>
                        {predictDischargeDelay(a).risk} delay risk (
                        {predictDischargeDelay(a).confidence}% confidence).
                        Likely blockers:{" "}
                        {a.blockers
                          .filter((b) => b.status !== "Complete")
                          .map((b) => b.name)
                          .join(", ")}
                        .
                      </p>
                    </AIBox>
                  )}
                <div className="checklist">
                  {a.blockers.map((b) => (
                    <div key={b.id}>
                      <span>{b.name}</span>
                      <Badge
                        tone={
                          b.status === "Complete"
                            ? "success"
                            : b.status === "Blocked"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {b.status}
                      </Badge>
                      <select
                        value={b.status}
                        disabled={!manageFlow}
                        onChange={(e) => {
                          s.resolveBlocker(
                            a.id,
                            b.id,
                            e.target.value as typeof b.status,
                          );
                          toast.success(`${b.name}: ${e.target.value}`);
                        }}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Blocked</option>
                        <option>Complete</option>
                        <option>Not Required</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="cardactions">
                  <Button
                    disabled={!manageFlow || ready(a) < 100}
                    onClick={() => discharge(a)}
                  >
                    Discharge patient
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
      {manageFlow && bedEdit && (
        <Modal
          title={`Manage Bed ${bedEdit.id}`}
          onClose={() => setBedEdit(undefined)}
        >
          <Field label="Bed state">
            <select
              value={bedEdit.status}
              disabled={bedEdit.status === "Occupied"}
              onChange={(e) => {
                s.updateBed(bedEdit.id, e.target.value as Bed["status"]);
                setBedEdit({
                  ...bedEdit,
                  status: e.target.value as Bed["status"],
                });
                toast.success("Bed state updated");
              }}
            >
              <option>Available</option>
              <option>Cleaning</option>
              <option>Reserved</option>
              <option>Unavailable</option>
              {bedEdit.status === "Occupied" && <option>Occupied</option>}
            </select>
          </Field>
          {bedEdit.status === "Occupied" && (
            <p className="notice">
              Occupied beds are released through the discharge workflow.
            </p>
          )}
          <div className="modalactions">
            <Button onClick={() => setBedEdit(undefined)}>Done</Button>
          </div>
        </Modal>
      )}
      {manageFlow && admit && (
        <Modal title="Admit patient" onClose={() => setAdmit(false)} wide>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                pid = String(f.get("patient")),
                bed = String(f.get("bed"));
              useStore.setState((st) => ({
                admissions: [
                  ...st.admissions,
                  {
                    id: crypto.randomUUID(),
                    patientId: pid,
                    ward: st.beds.find((b) => b.id === bed)?.ward || "Ward 4B",
                    bedId: bed,
                    consultant: String(f.get("consultant")),
                    reason: String(f.get("reason")),
                    expected: String(f.get("expected")),
                    status: "Active",
                    blockers: ["Clinical Review", "Pharmacy", "Transport"].map(
                      (name) => ({
                        id: crypto.randomUUID(),
                        name,
                        status: "Pending",
                      }),
                    ),
                  },
                ],
                beds: st.beds.map((b) =>
                  b.id === bed
                    ? { ...b, status: "Occupied", patientId: pid }
                    : b,
                ),
                patients: st.patients.map((p) =>
                  p.id === pid ? { ...p, status: "Admitted" } : p,
                ),
              }));
              setAdmit(false);
              toast.success("Patient admitted");
            }}
          >
            <div className="formgrid">
              <Field label="Patient">
                <select name="patient">
                  {s.patients
                    .filter((p) => p.status !== "Admitted")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Available bed">
                <select name="bed">
                  {s.beds
                    .filter((b) => b.status === "Available")
                    .map((b) => (
                      <option key={b.id}>{b.id}</option>
                    ))}
                </select>
              </Field>
              <Field label="Consultant">
                <input name="consultant" defaultValue="Dr Maya Chen" />
              </Field>
              <Field label="Reason">
                <input required name="reason" />
              </Field>
              <Field label="Expected discharge">
                <input type="date" name="expected" defaultValue="2026-08-14" />
              </Field>
            </div>
            <div className="modalactions">
              <Button>Admit patient</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
