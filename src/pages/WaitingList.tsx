import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock3,
  MapPin,
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
  AIBox,
  Field,
  Select,
} from "../components";
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
  const targetDays = (entry: WaitEntry) =>
    entry.targetDays ??
    (entry.priority === "Critical" ? 2 : entry.priority === "Urgent" ? 7 : 28);
  const missingFor = (entry: WaitEntry) =>
    entry.missing ??
    s.referrals.find(
      (referral) =>
        referral.id === entry.referralId ||
        (!entry.referralId && referral.patientId === entry.patientId),
    )?.missing ??
    [];
  const slotDate = (date: string) => {
    const value = new Date(`${date}T12:00:00`);
    return {
      day: value.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: value.toLocaleDateString("en-GB", { month: "short" }),
      weekday: value.toLocaleDateString("en-GB", { weekday: "short" }),
    };
  };
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
              <th>Wait / target</th>
              <th>Risk</th>
              <th>Breach</th>
              <th>No-shows</th>
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
                <td>
                  <b>{days(w.since)} days</b>
                  <small>Target {targetDays(w)} days</small>
                </td>
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
                  <Badge
                    tone={days(w.since) > targetDays(w) ? "danger" : "success"}
                  >
                    {days(w.since) > targetDays(w)
                      ? `${days(w.since) - targetDays(w)}d overdue`
                      : `${targetDays(w) - days(w.since)}d remaining`}
                  </Badge>
                </td>
                <td>{w.noShows ?? 0}</td>
                <td>
                  {missingFor(w).length ? (
                    <span title={missingFor(w).join(", ")}>
                      {missingFor(w).join(", ")}
                    </span>
                  ) : (
                    <Badge tone="success">Complete</Badge>
                  )}
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
              {slots.map((x, i) => {
                const date = slotDate(x.date);
                const isSelected = slot === i;
                return (
                  <button
                    type="button"
                    key={`${x.date}-${x.time}-${x.practitioner}`}
                    className={`appointment-slot ${isSelected ? "selected" : ""}`}
                    aria-pressed={isSelected}
                    onClick={() => setSlot(i)}
                  >
                    <span className="slotdate" aria-label={x.date}>
                      <small>{date.month}</small>
                      <strong>{date.day}</strong>
                      <small>{date.weekday}</small>
                    </span>
                    <span className="slotdetails">
                      <span className="slottime">
                        <Clock3 size={16} />
                        {x.time}
                      </span>
                      <span>
                        <UserRound size={15} />
                        {x.practitioner}
                      </span>
                      <span>
                        <MapPin size={15} />
                        {x.location}
                      </span>
                      <span className="slotreasons">
                        {x.reason.map((reason) => (
                          <small key={reason}>{reason}</small>
                        ))}
                      </span>
                    </span>
                    <span className="slotmeta">
                      {i === 0 && (
                        <Badge tone="ai">
                          <Sparkles size={12} /> AI recommended
                        </Badge>
                      )}
                      <strong>{x.score}% match</strong>
                      <CheckCircle2
                        className="slotcheck"
                        size={22}
                        aria-hidden
                      />
                    </span>
                    <b className="slotlegacy">
                      {x.date} · {x.time}
                    </b>
                    <span className="slotlegacy">
                      {x.practitioner} · {x.location}
                    </span>
                    {i === 0 && <Badge tone="ai">AI RECOMMENDED</Badge>}
                  </button>
                );
              })}
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
              <Select name="action">
                <option>Request missing information</option>
                <option>Contact patient</option>
                <option>Confirm availability</option>
                <option>Escalate breach risk</option>
              </Select>
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
