import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { useStore } from "../store";
import { Page, Card, Button, Badge, Modal, Field, Select } from "../components";
import type { Appointment } from "../types";
import { can } from "../permissions";

export function Appointments() {
  const s = useStore(),
    [params] = useSearchParams();
  const scheduler = can(s.role, "schedule");
  const [view, setView] = useState("Calendar"),
    [open, setOpen] = useState(Boolean(params.get("patient"))),
    [edit, setEdit] = useState<Appointment>(),
    [week, setWeek] = useState(
      startOfWeek(new Date("2026-08-11"), { weekStartsOn: 1 }),
    ),
    [reminder, setReminder] = useState<Appointment>();
  const days = Array.from({ length: 5 }, (_, i) => addDays(week, i));
  const name = (id: string) => {
    const p = s.patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  };
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      data = {
        patientId: String(f.get("patient")),
        specialty: String(f.get("specialty")),
        practitioner: String(f.get("practitioner")),
        date: String(f.get("date")),
        time: String(f.get("time")),
        location: String(f.get("location")),
        type: String(f.get("type")),
        duration: Number(f.get("duration")),
        notes: String(f.get("notes")),
      };
    const ok = edit
      ? s.updateAppointment(edit.id, data)
      : s.addAppointment({
          id: `A-${820 + s.appointments.length}`,
          ...data,
          status: "Scheduled",
        });
    if (!ok) {
      toast.error("Appointment conflict", {
        description:
          "The practitioner already has an appointment at this time.",
      });
      return;
    }
    toast.success(edit ? "Appointment rescheduled" : "Appointment booked");
    setOpen(false);
    setEdit(undefined);
  };
  const status = (a: Appointment, v: Appointment["status"]) => {
    s.updateAppointment(a.id, { status: v });
    toast.success(`Attendance updated to ${v}`);
  };
  return (
    <Page
      title="Appointments"
      subtitle="Coordinate practitioner calendars, attendance and patient communications."
      action={
        scheduler ? (
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Book appointment
          </Button>
        ) : undefined
      }
    >
      <div className="viewbar">
        <div className="segmented">
          <button
            className={view === "Calendar" ? "active" : ""}
            onClick={() => setView("Calendar")}
          >
            Calendar
          </button>
          <button
            className={view === "List" ? "active" : ""}
            onClick={() => setView("List")}
          >
            List
          </button>
        </div>
        <div className="datecontrol">
          <button
            aria-label="Previous week"
            onClick={() => setWeek(addWeeks(week, -1))}
          >
            <ChevronLeft />
          </button>
          <b>
            {format(days[0], "d MMM")}–{format(days[4], "d MMM yyyy")}
          </b>
          <button
            aria-label="Next week"
            onClick={() => setWeek(addWeeks(week, 1))}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      {view === "Calendar" ? (
        <Card>
          <div className="calendar">
            <div className="calhead">
              <span>Time</span>
              {days.map((x) => (
                <b key={x.toISOString()}>{format(x, "EEE d")}</b>
              ))}
            </div>
            {Array.from(
              { length: 8 },
              (_, i) => `${String(i + 8).padStart(2, "0")}:00`,
            ).map((time, i) => (
              <div className="calrow" key={time}>
                <span>{time}</span>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    onDoubleClick={() => scheduler && setOpen(true)}
                  >
                    {s.appointments
                      .filter(
                        (a) =>
                          Number(a.time.slice(0, 2)) === 8 + i &&
                          a.date === format(day, "yyyy-MM-dd"),
                      )
                      .map((a) => (
                        <button
                          className="event"
                          key={a.id}
                          onClick={() => scheduler && setEdit(a)}
                        >
                          <b>
                            {a.time} {name(a.patientId)}
                          </b>
                          <small>
                            {a.specialty} · {a.practitioner}
                          </small>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & time</th>
                <th>Practitioner</th>
                <th>Service</th>
                <th>Status</th>
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {s.appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{name(a.patientId)}</b>
                  </td>
                  <td>
                    {a.date} · {a.time}
                  </td>
                  <td>{a.practitioner}</td>
                  <td>
                    {a.specialty}
                    <small>{a.location}</small>
                  </td>
                  <td>
                    <Select
                      value={a.status}
                      onChange={(e) =>
                        status(a, e.target.value as Appointment["status"])
                      }
                    >
                      {[
                        "Scheduled",
                        "Confirmed",
                        "Arrived",
                        "In Progress",
                        "Completed",
                        "No-show",
                        "Cancelled",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </Select>
                  </td>
                  <td>{a.reminder || "Not sent"}</td>
                  <td>
                    <div className="rowactions">
                      {scheduler && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => setReminder(a)}
                          >
                            <Send />
                            Send
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setEdit(a)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              const reason = prompt("Cancellation reason");
                              if (reason !== null) {
                                s.updateAppointment(a.id, {
                                  status: "Cancelled",
                                  cancelReason: reason || "Not provided",
                                });
                                toast.success("Appointment cancelled");
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {(open || edit) && (
        <Modal
          title={edit ? "Reschedule appointment" : "Book appointment"}
          onClose={() => {
            setOpen(false);
            setEdit(undefined);
          }}
          wide
        >
          <form onSubmit={submit}>
            <div className="formgrid">
              <Field label="Patient">
                <Select
                  name="patient"
                  defaultValue={
                    edit?.patientId || params.get("patient") || undefined
                  }
                >
                  {s.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Specialty">
                <Select name="specialty" defaultValue={edit?.specialty}>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Respiratory Medicine</option>
                </Select>
              </Field>
              <Field label="Practitioner">
                <Select name="practitioner" defaultValue={edit?.practitioner}>
                  <option>Dr Sarah Wilson</option>
                  <option>Dr Ishan Patel</option>
                  <option>Dr Maya Chen</option>
                </Select>
              </Field>
              <Field label="Date">
                <input
                  required
                  type="date"
                  name="date"
                  defaultValue={edit?.date || format(days[3], "yyyy-MM-dd")}
                />
              </Field>
              <Field label="Time">
                <input
                  required
                  type="time"
                  name="time"
                  defaultValue={edit?.time || "10:30"}
                />
              </Field>
              <Field label="Location">
                <input
                  required
                  name="location"
                  defaultValue={edit?.location || "Clinic 2"}
                />
              </Field>
              <Field label="Appointment type">
                <Select name="type" defaultValue={edit?.type || "Consultation"}>
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Virtual Care</option>
                  <option>Procedure</option>
                </Select>
              </Field>
              <Field label="Duration">
                <Select name="duration" defaultValue={edit?.duration || 30}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </Select>
              </Field>
              <Field label="Notes">
                <textarea name="notes" defaultValue={edit?.notes} rows={3} />
              </Field>
            </div>
            <div className="modalactions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setEdit(undefined);
                }}
              >
                Cancel
              </Button>
              <Button>{edit ? "Save changes" : "Book appointment"}</Button>
            </div>
          </form>
        </Modal>
      )}
      {reminder && (
        <Modal
          title="Send appointment reminder"
          onClose={() => setReminder(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const channels = ["SMS", "Email", "Patient Portal"].filter((x) =>
                f.has(x),
              );
              if (!channels.length) {
                toast.error("Select at least one channel");
                return;
              }
              s.updateAppointment(reminder.id, {
                reminder: `Today, ${format(new Date(), "HH:mm")}`,
                reminderChannels: channels,
              });
              setReminder(undefined);
              toast.success("Reminder sent successfully");
            }}
          >
            <p>
              Choose one or more simulated delivery channels for{" "}
              {name(reminder.patientId)}.
            </p>
            <label>
              <input name="SMS" type="checkbox" defaultChecked /> SMS
            </label>
            <label>
              <input name="Email" type="checkbox" defaultChecked /> Email
            </label>
            <label>
              <input name="Patient Portal" type="checkbox" /> Patient Portal
            </label>
            <div className="modalactions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setReminder(undefined)}
              >
                Cancel
              </Button>
              <Button type="submit">Send reminder</Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
