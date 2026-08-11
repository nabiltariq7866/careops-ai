import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  Pill,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useStore } from "../store";
import {
  Page,
  Card,
  Button,
  Badge,
  Modal,
  Field,
  AIBox,
  Select,
} from "../components";
import type { Incident } from "../types";
import {
  analyzeMedicationNarrative,
  findSimilarIncidents,
} from "../services/ai/medicationSafetyAI";
import { can } from "../permissions";
type IncidentDraft = Omit<Incident, "id" | "status" | "at"> & {
  extractedTime: string;
  harm: string;
};
export function MedicationSafety() {
  const s = useStore();
  const safetyReviewer = can(s.role, "safety-review");
  const [report, setReport] = useState<"Incident" | "ADR">(),
    [step, setStep] = useState(0),
    [review, setReview] = useState<Incident>(),
    [similar, setSimilar] = useState<Incident>(),
    [action, setAction] = useState<Incident>(),
    [draft, setDraft] = useState<IncidentDraft>();
  const name = (id: string) => {
    const p = s.patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStep(1);
    try {
      const extracted = await analyzeMedicationNarrative(
        String(f.get("narrative")),
      );
      setDraft({
        patientId: String(f.get("patient")),
        medication: extracted.medication || String(f.get("medication")),
        prescribed: extracted.prescribed || String(f.get("prescribed")),
        administered: extracted.administered || String(f.get("administered")),
        type:
          report === "ADR"
            ? "Adverse Drug Reaction"
            : extracted.type === "Medication Event"
              ? String(f.get("type"))
              : extracted.type,
        severity: String(f.get("severity")) as Incident["severity"],
        ward: String(f.get("ward")),
        narrative: String(f.get("narrative")),
        extractedTime: extracted.time,
        harm: extracted.harm,
      });
      setStep(2);
    } catch {
      setStep(0);
      toast.error("AI extraction failed", {
        description: "You can submit the structured form manually.",
      });
    }
  };
  const confirmDraft = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft || !report) return;
    const f = new FormData(e.currentTarget);
    s.addIncident({
      id: `${report === "ADR" ? "ADR" : "MI"}-${crypto.randomUUID().slice(0, 5)}`,
      patientId: draft.patientId,
      medication: String(f.get("medication")),
      prescribed: String(f.get("prescribed")),
      administered: String(f.get("administered")),
      type: String(f.get("type")),
      severity: String(f.get("severity")) as Incident["severity"],
      ward: String(f.get("ward")),
      narrative: String(f.get("narrative")),
      status: "Awaiting Safety Review",
      at: new Date().toISOString(),
    });
    setReport(undefined);
    setDraft(undefined);
    setStep(0);
    toast.success(`${report} submitted for safety review`);
  };
  const closeReport = () => {
    setReport(undefined);
    setDraft(undefined);
    setStep(0);
  };
  const matches = (i: Incident) => findSimilarIncidents(i, s.incidents);
  const similarMatches = similar ? matches(similar) : [];
  return (
    <Page
      title="Medication & ADR Safety"
      subtitle="Report, review and learn from medication events with human oversight."
      action={
        can(s.role, "report-safety") ? (
          <div className="actions">
            <Button
              onClick={() => {
                setReport("Incident");
                setStep(0);
                setDraft(undefined);
              }}
            >
              <Plus />
              Report incident
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setReport("ADR");
                setStep(0);
                setDraft(undefined);
              }}
            >
              Report ADR
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="summaryrow">
        <Card>
          <strong>{s.incidents.length}</strong>
          <span>Incidents & ADRs</span>
        </Card>
        <Card>
          <strong>
            {
              s.incidents.filter((i) => i.status === "Awaiting Safety Review")
                .length
            }
          </strong>
          <span>Open reviews</span>
        </Card>
        <Card>
          <strong>
            {s.incidents.filter((i) => i.severity === "High").length}
          </strong>
          <span>High severity</span>
        </Card>
        <Card>
          <strong>
            {s.correctiveActions.filter((a) => a.status !== "Completed").length}
          </strong>
          <span>Open actions</span>
        </Card>
      </div>
      <Card>
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Patient</th>
              <th>Medication</th>
              <th>Classification</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {s.incidents.map((i) => (
              <tr key={i.id}>
                <td>
                  <b>{i.id}</b>
                  <small>{new Date(i.at).toLocaleString()}</small>
                </td>
                <td>{name(i.patientId)}</td>
                <td>
                  {i.medication}
                  <small>
                    {i.prescribed} → {i.administered}
                  </small>
                </td>
                <td>{i.type}</td>
                <td>
                  <Badge
                    tone={
                      i.severity === "High"
                        ? "danger"
                        : i.severity === "Moderate"
                          ? "warning"
                          : "success"
                    }
                  >
                    {i.severity}
                  </Badge>
                </td>
                <td>
                  <Badge
                    tone={
                      i.status === "Approved"
                        ? "success"
                        : i.status === "Closed"
                          ? ""
                          : "warning"
                    }
                  >
                    {i.status}
                  </Badge>
                </td>
                <td>
                  <div className="rowactions">
                    {safetyReviewer && (
                      <Button variant="secondary" onClick={() => setReview(i)}>
                        Review
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => setSimilar(i)}>
                      Similar ({matches(i).length})
                    </Button>
                    {safetyReviewer && (
                      <Button variant="secondary" onClick={() => setAction(i)}>
                        Root cause
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {report && (
        <Modal title={`Report ${report}`} onClose={closeReport} wide>
          {step < 2 ? (
            <form onSubmit={submit}>
              <Field label="Narrative">
                <textarea
                  required
                  name="narrative"
                  rows={4}
                  defaultValue={
                    report === "ADR"
                      ? "Patient developed a rash shortly after the first dose. Medication withheld and clinician notified."
                      : "Patient received 10mg instead of prescribed 5mg. No immediate harm observed."
                  }
                />
              </Field>
              <div className="formgrid">
                <Field label="Patient">
                  <Select name="patient">
                    {s.patients.map((p) => (
                      <option value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Medication">
                  <input required name="medication" defaultValue="Amlodipine" />
                </Field>
                <Field label="Prescribed">
                  <input name="prescribed" defaultValue="5mg" />
                </Field>
                <Field
                  label={
                    report === "ADR" ? "Observed exposure" : "Administered"
                  }
                >
                  <input
                    name="administered"
                    defaultValue={report === "ADR" ? "5mg" : "10mg"}
                  />
                </Field>
                <Field label="Classification">
                  <Select
                    name="type"
                    defaultValue={
                      report === "ADR" ? "Adverse Drug Reaction" : "Wrong Dose"
                    }
                  >
                    <option>Wrong Dose</option>
                    <option>Omitted Dose</option>
                    <option>Wrong Medication</option>
                    <option>Adverse Drug Reaction</option>
                  </Select>
                </Field>
                <Field label="Severity">
                  <Select name="severity">
                    <option>Low</option>
                    <option>Moderate</option>
                    <option>High</option>
                  </Select>
                </Field>
                <Field label="Ward">
                  <input name="ward" defaultValue="Ward 4B" />
                </Field>
              </div>
              <div className="modalactions">
                <Button variant="secondary" type="button" onClick={closeReport}>
                  Cancel
                </Button>
                <Button disabled={step === 1}>
                  <Sparkles />
                  {step === 1 ? "Analyzing narrativeâ€¦" : "Analyze narrative"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={confirmDraft}>
              <AIBox title="AI Extraction">
                <p>
                  Review and edit every extracted field before this {report}
                  is added to the safety record.
                </p>
                <div className="extractionmeta">
                  <span>
                    Event time<b>{draft?.extractedTime}</b>
                  </span>
                  <span>
                    Harm assessment<b>{draft?.harm}</b>
                  </span>
                </div>
              </AIBox>
              <Field label="Narrative">
                <textarea
                  required
                  name="narrative"
                  rows={3}
                  defaultValue={draft?.narrative}
                />
              </Field>
              <div className="formgrid">
                <Field label="Medication">
                  <input
                    required
                    name="medication"
                    defaultValue={draft?.medication}
                  />
                </Field>
                <Field label="Ward">
                  <input required name="ward" defaultValue={draft?.ward} />
                </Field>
                <Field label="Prescribed">
                  <input name="prescribed" defaultValue={draft?.prescribed} />
                </Field>
                <Field label="Administered / exposure">
                  <input
                    name="administered"
                    defaultValue={draft?.administered}
                  />
                </Field>
                <Field label="Classification">
                  <Select name="type" defaultValue={draft?.type}>
                    <option>Wrong Dose</option>
                    <option>Omitted Dose</option>
                    <option>Wrong Medication</option>
                    <option>Medication Event</option>
                    <option>Adverse Drug Reaction</option>
                  </Select>
                </Field>
                <Field label="Severity">
                  <Select name="severity" defaultValue={draft?.severity}>
                    <option>Low</option>
                    <option>Moderate</option>
                    <option>High</option>
                  </Select>
                </Field>
              </div>
              <div className="modalactions">
                <Button variant="secondary" type="button" onClick={closeReport}>
                  Discard draft
                </Button>
                <Button type="submit">Confirm & submit</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
      {review && (
        <Modal
          title={`Safety Review · ${review.id}`}
          onClose={() => setReview(undefined)}
        >
          <Field label="Classification">
            <Select
              value={review.type}
              onChange={(e) => {
                s.reviewIncident(review.id, review.status);
                useStore.setState((st) => ({
                  incidents: st.incidents.map((i) =>
                    i.id === review.id ? { ...i, type: e.target.value } : i,
                  ),
                }));
                setReview({ ...review, type: e.target.value });
              }}
            >
              <option>Wrong Dose</option>
              <option>Omitted Dose</option>
              <option>Wrong Medication</option>
              <option>Adverse Drug Reaction</option>
            </Select>
          </Field>
          <Field label="Severity">
            <Select
              value={review.severity}
              onChange={(e) => {
                useStore.setState((st) => ({
                  incidents: st.incidents.map((i) =>
                    i.id === review.id
                      ? {
                          ...i,
                          severity: e.target.value as Incident["severity"],
                        }
                      : i,
                  ),
                }));
                setReview({
                  ...review,
                  severity: e.target.value as Incident["severity"],
                });
              }}
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </Select>
          </Field>
          <div className="modalactions">
            <Button
              variant="secondary"
              onClick={() => {
                s.addTask({
                  id: crypto.randomUUID(),
                  patientId: review.patientId,
                  title: `More information required for ${review.id}`,
                  owner: "Reporting Nurse",
                  due: "2026-08-13",
                  status: "Pending",
                  category: "Safety Review",
                });
                toast.success("Information request created");
                setReview(undefined);
              }}
            >
              Request information
            </Button>
            <Button
              onClick={() => {
                s.reviewIncident(review.id, "Approved");
                toast.success("Safety review approved");
                setReview(undefined);
              }}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                s.reviewIncident(review.id, "Closed");
                setReview(undefined);
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
      {similar && (
        <Modal
          title={`Similar incidents · ${similar.medication}`}
          onClose={() => setSimilar(undefined)}
          wide
        >
          <div className="similarincidents">
            <div className="similarintro">
              <span className="similaricon">
                <Sparkles size={20} />
              </span>
              <div>
                <h3>{similarMatches.length} potential match found</h3>
                <p>
                  Ranked using medication, ward, event type and clinical
                  severity factors.
                </p>
              </div>
            </div>
            {similarMatches.length ? (
              <div className="similargrid">
                {similarMatches.map((incident) => (
                  <article className="similarcard" key={incident.id}>
                    <header>
                      <div>
                        <b>{incident.id}</b>
                        <small>
                          {new Date(incident.at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </div>
                      <Badge
                        tone={
                          incident.severity === "High"
                            ? "danger"
                            : incident.severity === "Moderate"
                              ? "warning"
                              : "success"
                        }
                      >
                        <AlertTriangle size={12} /> {incident.severity}
                      </Badge>
                    </header>
                    <div className="similarfacts">
                      <span>
                        <Pill size={16} />
                        <small>Medication</small>
                        <b>{incident.medication}</b>
                      </span>
                      <span>
                        <AlertTriangle size={16} />
                        <small>Event type</small>
                        <b>{incident.type}</b>
                      </span>
                      <span>
                        <MapPin size={16} />
                        <small>Location</small>
                        <b>{incident.ward}</b>
                      </span>
                      <span>
                        <UserRound size={16} />
                        <small>Patient</small>
                        <b>{name(incident.patientId)}</b>
                      </span>
                    </div>
                    <p className="similarnarrative">{incident.narrative}</p>
                    <footer>
                      <span>
                        <CalendarDays size={14} /> {incident.status}
                      </span>
                      {safetyReviewer && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSimilar(undefined);
                            setReview(incident);
                          }}
                        >
                          Review incident
                        </Button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">No similar incidents found.</div>
            )}
          </div>
        </Modal>
      )}
      {action && (
        <Modal
          title={`Root Cause & Corrective Action · ${action.id}`}
          onClose={() => setAction(undefined)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              s.addCorrectiveAction({
                id: crypto.randomUUID(),
                incidentId: action.id,
                rootCause: String(f.get("root")),
                factors: String(f.get("factors")),
                action: String(f.get("action")),
                owner: String(f.get("owner")),
                due: String(f.get("due")),
                status: "Open",
              });
              toast.success("Corrective action recorded");
              setAction(undefined);
            }}
          >
            <div className="formgrid">
              <Field label="Potential root cause">
                <Select name="root">
                  <option>Medication packaging similarity</option>
                  <option>Manual transcription</option>
                  <option>Process issue</option>
                  <option>Training requirement</option>
                </Select>
              </Field>
              <Field label="Contributing factors">
                <input name="factors" defaultValue="Evening shift workload" />
              </Field>
              <Field label="Corrective action">
                <input required name="action" />
              </Field>
              <Field label="Owner">
                <input name="owner" defaultValue="Ward Safety Lead" />
              </Field>
              <Field label="Due date">
                <input type="date" name="due" defaultValue="2026-08-25" />
              </Field>
            </div>
            <div className="modalactions">
              <Button>Save action</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
