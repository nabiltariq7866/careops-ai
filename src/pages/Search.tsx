import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store";
import { Page, Card, Badge, Empty } from "../components";
export function SearchResults() {
  const s = useStore(),
    [params] = useSearchParams(),
    q = (params.get("q") || "").trim().toLowerCase();
  const patients = s.patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.id} ${p.phone}`.toLowerCase().includes(q),
  );
  const referrals = s.referrals.filter((r) =>
    `${r.id} ${r.source} ${r.service} ${r.status}`.toLowerCase().includes(q),
  );
  const tasks = s.tasks.filter((t) =>
    `${t.title} ${t.owner} ${t.category}`.toLowerCase().includes(q),
  );
  const appointments = s.appointments.filter((a) =>
    `${a.specialty} ${a.practitioner} ${a.location} ${a.status}`
      .toLowerCase()
      .includes(q),
  );
  const count =
    patients.length + referrals.length + tasks.length + appointments.length;
  return (
    <Page
      title="Global Search"
      subtitle={`${count} results across patients, referrals, tasks and appointments for “${q}”.`}
    >
      {!q ? (
        <Card>
          <Empty text="Enter a search term in the top navigation." />
        </Card>
      ) : !count ? (
        <Card>
          <Empty text="No matching CareOps records found." />
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
                  {t.owner} · due {t.due}
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
                  {a.specialty} · {a.date} {a.time}
                </b>
                <span>
                  {a.practitioner} · {a.location}
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
      <h2>
        {title} <small>({rows.length})</small>
      </h2>
      {rows.length ? (
        <div className="searchresults">
          {rows.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      ) : (
        <Empty text={`No matching ${title.toLowerCase()}.`} />
      )}
    </Card>
  );
}
