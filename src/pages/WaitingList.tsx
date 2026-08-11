import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useStore } from "../store";
import { Page, Card, Button, Badge, Modal, AIBox, Field } from "../components";
import type { WaitEntry } from "../types";
import { recommendAppointments, type Slot } from "../services/ai/waitingListAI";
const fallbackSlots: Slot[] = [
  {
    practitioner: "Dr Sarah Wilson",
    date: "2026-08-13",
    time: "10:30",
    location: "Clinic 2",
    score: 96,
    reason: ["Earliest suitable slot"],
  },
  {
    practitioner: "Dr Ishan Patel",
    date: "2026-08-14",
    time: "14:15",
    location: "Clinic 4",
    score: 89,
    reason: ["Specialty match"],
  },
  {
    practitioner: "Dr Sarah Wilson",
    date: "2026-08-18",
    time: "09:30",
    location: "Clinic 2",
    score: 84,
    reason: ["Morning preference"],
  },
];
export function WaitingList() {
  const s = useStore();
  const [selected, setSelected] = useState<WaitEntry>(),
    [slot, setSlot] = useState(0),
    [follow, setFollow] = useState<WaitEntry>(),
    [slots, setSlots] = useState<Slot[]>(fallbackSlots),
    [loading, setLoading] = useState(false);
  const name = (id: string) => {
    const p = s.patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  };
  const days = (d: string) =>
    Math.max(
      1,
      Math.floor((+new Date("2026-08-11") - +new Date(d)) / 86400000),
    );
  const assign = () => {
    if (!selected) return;
    const x = slots[slot];
    s.assignAppointment(selected.id, {
      id: crypto.randomUUID(),
      patientId: selected.patientId,
      practitioner: x.practitioner,
      specialty: selected.specialty,
      date: x.date,
      time: x.time,
      location: x.location,
      type: "Initial consultation",
      status: "Scheduled",
    });
    setSelected(undefined);
    toast.success("Appointment assigned", {
      description: "Calendar and patient timeline updated.",
    });
  };
  return (
    <Page
      title="Waiting List"
      subtitle="Prioritize demand, monitor breach risk and coordinate administrative follow-up."
    >
      <Card>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Specialty</th>
              <th>Priority</th>
              <th>Days</th>
              <th>Risk</th>
              <th>Missing info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {s.waiting.map((w) => (
              <tr key={w.id}>
                <td>
                  <b>{name(w.patientId)}</b>
                  <small>{w.patientId}</small>
                </td>
                <td>{w.specialty}</td>
                <td>{w.priority}</td>
                <td>{days(w.since)}</td>
                <td>
                  <Badge
                    tone={
                      w.risk === "High"
                        ? "danger"
                        : w.risk === "Medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {w.risk}
                  </Badge>
                </td>
                <td>
                  {w.priority === "Urgent" ? "Medication list" : "Complete"}
                </td>
                <td>
                  <div className="rowactions">
                    {w.status === "Waiting" ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelected(w);
                          setSlot(0);
                          setLoading(true);
                          recommendAppointments(w, s.appointments)
                            .then(setSlots)
                            .catch(() => {
                              setSlots(fallbackSlots);
                              toast.error(
                                "AI slot service unavailable; showing safe demo alternatives",
                              );
                            })
                            .finally(() => setLoading(false));
                        }}
                      >
                        <Sparkles />
                        Find slot
                      </Button>
                    ) : (
                      <Badge tone="success">Scheduled</Badge>
                    )}
                    <Button variant="secondary" onClick={() => setFollow(w)}>
                      Follow up
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {selected && (
        <Modal
          title="Select Optimal Appointment"
          onClose={() => setSelected(undefined)}
        >
          <AIBox>
            <h3>Recommended slots for {name(selected.patientId)}</h3>
            <p>
              Ranked by urgency, specialty match, availability and synthetic
              patient preferences.
            </p>
          </AIBox>
          {loading ? (
            <div className="processing">
              <div className="spinner" />
              <p>Finding suitable appointments…</p>
            </div>
          ) : (
            <div className="slotlist">
              {slots.map((x, i) => (
                <button
                  className={slot === i ? "selected" : ""}
                  onClick={() => setSlot(i)}
                >
                  <b>
                    {x.date} · {x.time}
                  </b>
                  <span>
                    {x.practitioner} · {x.location}
                  </span>
                  {i === 0 && <Badge tone="ai">AI RECOMMENDED</Badge>}
                </button>
              ))}
            </div>
          )}
          <div className="modalactions">
            <Button variant="secondary" onClick={() => setSelected(undefined)}>
              Cancel
            </Button>
            <Button onClick={assign}>Assign selected slot</Button>
          </div>
        </Modal>
      )}
      {follow && (
        <Modal
          title="Administrative Follow-up"
          onClose={() => setFollow(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              s.addTask({
                id: crypto.randomUUID(),
                patientId: follow.patientId,
                title: String(f.get("action")),
                owner: String(f.get("owner")),
                due: String(f.get("due")),
                status: "Pending",
                category: "Waiting List",
              });
              toast.success("Follow-up task created");
              setFollow(undefined);
            }}
          >
            <Field label="Action">
              <select name="action">
                <option>Request missing information</option>
                <option>Contact patient</option>
                <option>Confirm availability</option>
                <option>Escalate breach risk</option>
              </select>
            </Field>
            <Field label="Owner">
              <input name="owner" defaultValue="Referral Coordination" />
            </Field>
            <Field label="Due">
              <input type="date" name="due" defaultValue="2026-08-12" />
            </Field>
            <div className="modalactions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setFollow(undefined)}
              >
                Cancel
              </Button>
              <Button>Create task</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
