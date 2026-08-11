import { useState } from "react";
import { toast } from "sonner";
import { FileUp, Plus, Sparkles } from "lucide-react";
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
import type { Referral } from "../types";
import { analyzeReferral } from "../services/ai/referralAI";

export function Referrals() {
  const s = useStore();
  const [selected, setSelected] = useState<Referral>(),
    [step, setStep] = useState(0),
    [creating, setCreating] = useState(false),
    [editing, setEditing] = useState(false),
    [file, setFile] = useState<File>();
  const patient = (id: string) => s.patients.find((x) => x.id === id);
  const run = async () => {
    if (!selected) return;
    setStep(1);
    [2, 3, 4, 5, 6].forEach((n, i) =>
      setTimeout(() => setStep(n), (i + 1) * 220),
    );
    try {
      const result = await analyzeReferral(
        selected,
        patient(selected.patientId),
      );
      s.updateReferral(selected.id, {
        suggested: result.specialty,
        urgency: result.urgency,
        confidence: result.confidence,
        missing: result.missing,
      });
      setSelected({
        ...selected,
        suggested: result.specialty,
        urgency: result.urgency,
        confidence: result.confidence,
        missing: result.missing,
      });
    } catch {
      toast.error("AI analysis failed", {
        description: "Referral remains available for manual review.",
      });
      setStep(0);
    }
  };
  const decision = (status: "Approved" | "Rejected") => {
    if (!selected) return;
    if (status === "Approved") s.approveReferral(selected.id);
    else s.updateReferral(selected.id, { status });
    toast.success(`Referral ${status.toLowerCase()}`, {
      description:
        status === "Approved"
          ? "Waiting-list entry and timeline updated."
          : "Staff decision recorded with audit timestamp.",
    });
    setSelected(undefined);
  };
  return (
    <Page
      title="Referral Inbox"
      subtitle="Review, triage and route incoming referrals with human oversight."
      action={
        <div className="actions">
          <Button variant="secondary" onClick={() => setCreating(true)}>
            <FileUp />
            Upload referral
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus />
            New referral
          </Button>
        </div>
      }
    >
      <div className="summaryrow">
        <Card>
          <strong>{s.referrals.length}</strong>
          <span>All referrals</span>
        </Card>
        <Card>
          <strong>
            {s.referrals.filter((r) => r.status === "Needs Review").length}
          </strong>
          <span>Needs review</span>
        </Card>
        <Card>
          <strong>
            {s.referrals.filter((r) => r.urgency !== "Routine").length}
          </strong>
          <span>Urgent</span>
        </Card>
        <Card>
          <strong>
            {s.referrals.filter((r) => r.status === "Approved").length}
          </strong>
          <span>Approved</span>
        </Card>
      </div>
      <Card>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Source</th>
              <th>Service</th>
              <th>AI suggestion</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {s.referrals.map((r) => {
              const p = patient(r.patientId);
              return (
                <tr key={r.id}>
                  <td>
                    <b>
                      {p?.firstName} {p?.lastName}
                    </b>
                    <small>{r.patientId}</small>
                  </td>
                  <td>{r.source}</td>
                  <td>{r.service}</td>
                  <td>
                    <span className="aiinline">
                      <Sparkles />
                      {r.suggested} · {r.confidence}%
                    </span>
                  </td>
                  <td>
                    <Badge
                      tone={
                        r.urgency === "Routine"
                          ? ""
                          : r.urgency === "Urgent"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {r.urgency}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        r.status === "Approved"
                          ? "success"
                          : r.status === "Rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td>{r.received}</td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelected(r);
                        setStep(0);
                        setEditing(false);
                      }}
                    >
                      {r.status === "Needs Review" ? "Review" : "View"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {creating && (
        <Modal title="New referral" onClose={() => setCreating(false)} wide>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                pid = String(f.get("patient")),
                service = String(f.get("service")),
                id = `R-${2410 + s.referrals.length}`;
              s.addReferral({
                id,
                patientId: pid,
                source: String(f.get("source")),
                service,
                suggested: service,
                urgency: "Urgent",
                status: "Needs Review",
                received: new Date().toISOString().slice(0, 10),
                missing: file ? [] : ["Referral attachment"],
                confidence: 88 + (id.length % 8),
              });
              setCreating(false);
              toast.success("Referral ready for dynamic AI review");
            }}
          >
            <div className="uploadzone">
              <FileUp />
              <b>{file?.name || "Select a demo referral document"}</b>
              <span>PDF/JPG/PNG · maximum 10 MB</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 10 * 1024 * 1024) {
                    toast.error("File exceeds 10 MB");
                    e.target.value = "";
                    return;
                  }
                  setFile(f);
                }}
              />
            </div>
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
              <Field label="Referral source">
                <input
                  required
                  name="source"
                  defaultValue="Meadowbrook Medical Practice"
                />
              </Field>
              <Field label="Requested service">
                <Select name="service">
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Respiratory Medicine</option>
                  <option>General Medicine</option>
                </Select>
              </Field>
            </div>
            <div className="modalactions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button>Create referral</Button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal
          title={`Referral Review · ${selected.id}`}
          onClose={() => setSelected(undefined)}
          wide
        >
          {step === 0 ? (
            <div className="reviewdoc">
              <div className="document">
                <b>
                  {patient(selected.patientId)?.firstName}{" "}
                  {patient(selected.patientId)?.lastName} · referral document
                </b>
                <p>
                  Referral from {selected.source} requesting {selected.service}{" "}
                  assessment. Available context and missing information will be
                  evaluated using deterministic demo logic.
                </p>
              </div>
              <Button onClick={run}>
                <Sparkles />
                Analyze with AI
              </Button>
            </div>
          ) : step < 6 ? (
            <div className="processing">
              <div className="spinner" />
              <h3>
                {
                  [
                    "",
                    "Reading document…",
                    "Extracting patient information…",
                    "Reviewing referral context…",
                    "Identifying specialty and urgency…",
                    "Checking missing information…",
                  ][step]
                }
              </h3>
              <div className="progress">
                <i style={{ width: `${step * 18}%` }} />
              </div>
            </div>
          ) : (
            <>
              <AIBox>
                <div className="resultgrid">
                  <span>
                    Patient
                    <b>
                      {patient(selected.patientId)?.firstName}{" "}
                      {patient(selected.patientId)?.lastName}
                    </b>
                  </span>
                  <span>
                    AI specialty<b>{selected.suggested}</b>
                  </span>
                  <span>
                    AI urgency<b>{selected.urgency}</b>
                  </span>
                  <span>
                    Confidence<b>{selected.confidence}%</b>
                  </span>
                </div>
                <h4>Missing information</h4>
                <p>
                  {selected.missing.length
                    ? selected.missing.map((x) => `• ${x}`).join("\n")
                    : "No required items detected."}
                </p>
              </AIBox>
              {editing && (
                <form
                  id="modify-referral"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    s.updateReferral(selected.id, {
                      service: String(f.get("service")),
                      urgency: String(f.get("urgency")) as Referral["urgency"],
                      missing: String(f.get("missing"))
                        .split(",")
                        .filter(Boolean),
                    });
                    setSelected({
                      ...selected,
                      service: String(f.get("service")),
                      urgency: String(f.get("urgency")) as Referral["urgency"],
                    });
                    setEditing(false);
                    toast.success("Staff decision saved");
                  }}
                >
                  <div className="comparison">
                    <div>
                      <small>AI Suggested</small>
                      <b>
                        {selected.suggested} · {selected.urgency}
                      </b>
                    </div>
                    <div>
                      <small>Final Staff Decision</small>
                      <Field label="Service">
                        <Select name="service" defaultValue={selected.service}>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>Respiratory Medicine</option>
                          <option>General Medicine</option>
                        </Select>
                      </Field>
                      <Field label="Urgency">
                        <Select name="urgency" defaultValue={selected.urgency}>
                          <option>Routine</option>
                          <option>Urgent</option>
                          <option>Critical</option>
                        </Select>
                      </Field>
                      <Field label="Missing information (comma separated)">
                        <input
                          name="missing"
                          defaultValue={selected.missing.join(",")}
                        />
                      </Field>
                    </div>
                  </div>
                </form>
              )}
              <div className="modalactions">
                <Button variant="danger" onClick={() => decision("Rejected")}>
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Cancel modification" : "Modify"}
                </Button>
                {editing ? (
                  <Button form="modify-referral">Save staff decision</Button>
                ) : (
                  selected.status === "Needs Review" && (
                    <Button onClick={() => decision("Approved")}>
                      Approve
                    </Button>
                  )
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </Page>
  );
}
