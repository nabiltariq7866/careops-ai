import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store";
import { Page, Card, Badge, Empty } from "../components";
export function SearchResults() {
  const [q] = useSearchParams(),
    term = (q.get("q") || "").trim().toLowerCase(),
    s = useStore();
  const patients = s.patients.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.id} ${p.phone}`
        .toLowerCase()
        .includes(term),
    ),
    referrals = s.referrals.filter((r) =>
      `${r.id} ${r.source} ${r.service} ${r.status}`
        .toLowerCase()
        .includes(term),
    ),
    tasks = s.tasks.filter((t) =>
      `${t.title} ${t.owner} ${t.category}`.toLowerCase().includes(term),
    ),
    appointments = s.appointments.filter((a) =>
      `${a.practitioner} ${a.specialty} ${a.location}`
        .toLowerCase()
        .includes(term),
    );
  const total =
    patients.length + referrals.length + tasks.length + appointments.length;
  return (
    <Page
      title="Global Search"
      subtitle={`${total} results for “${q.get("q") || ""}” across CareOps.`}
    >
      {!term ? (
        <Card>
          <Empty text="Enter a patient, referral, task, practitioner or service." />
        </Card>
      ) : (
        <div className="grid two">
          <Result
            title="Patients"
            rows={patients.map((p) => (
              <Link to={`/patients/${p.id}`}>
                <b>
                  {p.firstName} {p.lastName}
                </b>
                <span>
                  {p.id} · {p.ward}
                </span>
                <Badge>{p.status}</Badge>
              </Link>
            ))}
          />
          <Result
            title="Referrals"
            rows={referrals.map((r) => (
              <Link to="/referrals">
                <b>
                  {r.id} · {r.service}
                </b>
                <span>{r.source}</span>
                <Badge>{r.status}</Badge>
              </Link>
            ))}
          />
          <Result
            title="Tasks"
            rows={tasks.map((t) => (
              <Link to="/patient-flow">
                <b>{t.title}</b>
                <span>
                  {t.owner} · {t.due}
                </span>
                <Badge>{t.status}</Badge>
              </Link>
            ))}
          />
          <Result
            title="Appointments"
            rows={appointments.map((a) => (
              <Link to="/appointments">
                <b>
                  {a.specialty} · {a.practitioner}
                </b>
                <span>
                  {a.date} {a.time} · {a.location}
                </span>
                <Badge>{a.status}</Badge>
              </Link>
            ))}
          />
        </div>
      )}
    </Page>
  );
}
function Result({ title, rows }: { title: string; rows: React.ReactNode[] }) {
  return (
    <Card>
      <h2>{title}</h2>
      {rows.length ? (
        <div className="searchresults">
          {rows.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      ) : (
        <Empty text={`No ${title.toLowerCase()} found.`} />
      )}
    </Card>
  );
}
