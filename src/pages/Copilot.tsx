import { useMemo, useState } from "react";
import { Send, Sparkles, FileText } from "lucide-react";
import { useStore } from "../store";
import { Page, Card, Button, Badge } from "../components";
import { policyAnswer } from "../services/ai/copilotAI";
type Context = "Patient" | "Referral" | "Admission" | "Document" | "Policy";
export function Copilot() {
  const s = useStore();
  const [context, setContext] = useState<Context>("Patient"),
    [id, setId] = useState(s.patients[0].id),
    [prompt, setPrompt] = useState("Summarize this record."),
    [sent, setSent] = useState(false);
  const options = useMemo(
    () =>
      context === "Patient"
        ? s.patients.map((x) => [x.id, `${x.firstName} ${x.lastName}`])
        : context === "Referral"
          ? s.referrals.map((x) => [x.id, `${x.id} · ${x.service}`])
          : context === "Admission"
            ? s.admissions.map((x) => [x.id, `${x.id} · ${x.ward}`])
            : context === "Document"
              ? s.documents.map((x) => [x.id, x.name])
              : [
                  ["policy-med", "Medication Incident Policy"],
                  ["policy-discharge", "Discharge Coordination SOP"],
                ],
    [context, s],
  );
  const response = () => {
    if (context === "Patient") {
      const p = s.patients.find((x) => x.id === id) || s.patients[0],
        tasks = s.tasks.filter(
          (x) => x.patientId === p.id && x.status !== "Completed",
        );
      return {
        body: `${p.firstName} ${p.lastName} is currently ${p.status.toLowerCase()} in ${p.ward}. The record contains ${p.timeline.length} timeline events and ${tasks.length} outstanding tasks.`,
        sources: [`Patient Timeline · ${p.id}`, "Open Task Register"],
      };
    }
    if (context === "Referral") {
      const r = s.referrals.find((x) => x.id === id) || s.referrals[0];
      return {
        body: `Referral ${r.id} requests ${r.service} review with ${r.urgency.toLowerCase()} priority. AI suggested ${r.suggested} at ${r.confidence}% confidence. ${r.missing.length ? `Missing items: ${r.missing.join(", ")}.` : "No missing information is recorded."} Final status is ${r.status}.`,
        sources: [`Referral Document · ${r.id}`, "Referral Audit Trail"],
      };
    }
    if (context === "Admission") {
      const a = s.admissions.find((x) => x.id === id) || s.admissions[0],
        open = a.blockers.filter(
          (x) => x.status !== "Complete" && x.status !== "Not Required",
        );
      return {
        body: `Admission ${a.id} is ${a.status.toLowerCase()} in ${a.ward}, with expected discharge ${a.expected}. Outstanding dependencies: ${open.map((x) => `${x.name} (${x.status})`).join(", ") || "none"}.`,
        sources: [`Admission Record · ${a.id}`, "Discharge Checklist"],
      };
    }
    if (context === "Document") {
      const d = s.documents.find((x) => x.id === id) || s.documents[0];
      return {
        body: `${d.name} is a ${d.type.toLowerCase()} supplied by ${d.source} on ${d.uploadedAt}. This demo provides document metadata and a review-oriented draft; it does not infer clinical facts absent from the source.`,
        sources: [`${d.name} · ${d.uploadedAt}`],
      };
    }
    if (id) return policyAnswer(id);
    return id === "policy-discharge"
      ? {
          body: "The Discharge Coordination SOP requires all applicable dependencies to be completed or marked not required, responsible staff review, and a recorded release of the assigned bed.",
          sources: ["Discharge Coordination SOP · Demo revision 3.2"],
        }
      : {
          body: "Medication incidents should be reported promptly, reviewed by an authorized safety officer, classified with human oversight, and linked to corrective actions where a recurring pattern is validated.",
          sources: ["Medication Incident Policy · Demo revision 4.1"],
        };
  };
  const result = response();
  const change = (c: Context) => {
    setContext(c);
    setSent(false);
    setTimeout(() => {
      const st = useStore.getState();
      const first =
        c === "Patient"
          ? st.patients[0]?.id
          : c === "Referral"
            ? st.referrals[0]?.id
            : c === "Admission"
              ? st.admissions[0]?.id
              : c === "Document"
                ? st.documents[0]?.id
                : "policy-med";
      setId(first || "");
    }, 0);
  };
  return (
    <Page
      title="AI Healthcare Copilot"
      subtitle="Context-aware assistance with explicit source grounding and human review."
    >
      <div className="copilot">
        <Card className="context">
          <h2>Context</h2>
          <label>
            Context type
            <select
              value={context}
              onChange={(e) => change(e.target.value as Context)}
            >
              {["Patient", "Referral", "Admission", "Document", "Policy"].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Selected record
            <select
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setSent(false);
              }}
            >
              {options.map(([value, label]) => (
                <option value={value}>{label}</option>
              ))}
            </select>
          </label>
          <h3>Suggested prompts</h3>
          {[
            "Summarize this record.",
            "What actions are outstanding?",
            "Draft a handover note.",
            "Identify the source-backed facts.",
          ].map((x) => (
            <button
              className="suggestion"
              onClick={() => {
                setPrompt(x);
                setSent(false);
              }}
            >
              {x}
            </button>
          ))}
        </Card>
        <Card className="chat">
          <div className="chathead">
            <div>
              <Sparkles />
              <b>CareOps Copilot</b>
            </div>
            <Badge tone="ai">DEMO AI</Badge>
          </div>
          <div className="messages">
            {!sent ? (
              <div className="welcome">
                <Sparkles />
                <h2>Ask about the selected {context.toLowerCase()}</h2>
                <p>Drafts are synthetic and require professional review.</p>
              </div>
            ) : (
              <>
                <div className="userbubble">{prompt}</div>
                <div className="assistant">
                  <div className="aititle">
                    <Sparkles />
                    AI-generated response
                  </div>
                  <p>{result.body}</p>
                  <div className="sources">
                    <b>Sources</b>
                    {result.sources.map((x) => (
                      <span key={x}>
                        <FileText />
                        {x}
                      </span>
                    ))}
                  </div>
                  <small>
                    AI-generated draft · Requires review before use · Not a
                    diagnosis
                  </small>
                </div>
              </>
            )}
          </div>
          <div className="composer">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
            />
            <Button
              disabled={!id || !prompt.trim()}
              onClick={() => setSent(true)}
            >
              <Send />
              Send
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
