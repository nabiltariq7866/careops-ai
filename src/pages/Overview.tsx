import { Card, Page, AIBox, Badge } from "../components";
import { useStore } from "../store";
import {
  Users,
  BedDouble,
  LogOut,
  FileWarning,
  CalendarDays,
  Pill,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
const trend = [
  { d: "Mon", flow: 82, wait: 118 },
  { d: "Tue", flow: 91, wait: 123 },
  { d: "Wed", flow: 86, wait: 121 },
  { d: "Thu", flow: 104, wait: 129 },
  { d: "Fri", flow: 97, wait: 127 },
  { d: "Sat", flow: 72, wait: 119 },
  { d: "Today", flow: 94, wait: 124 },
];
export function Overview() {
  const s = useStore();
  const active = s.admissions.filter((a) => a.status === "Active"),
    available = s.beds.filter((b) => b.status === "Available").length,
    atRisk = active.filter((a) =>
      a.blockers.some((b) => b.status === "Blocked"),
    ).length,
    today = s.appointments.filter((a) => a.date === "2026-08-11").length,
    openInc = s.incidents.filter((i) => i.status !== "Closed").length;
  const blockerCounts = active
    .flatMap((admission) => admission.blockers)
    .filter(
      (blocker) =>
        blocker.status !== "Complete" && blocker.status !== "Not Required",
    )
    .reduce<Record<string, number>>((counts, blocker) => {
      counts[blocker.name] = (counts[blocker.name] || 0) + 1;
      return counts;
    }, {});
  const blocks = Object.entries(blockerCounts)
    .map(([n, v]) => ({ n, v }))
    .sort((a, b) => b.v - a.v);
  const waitingSpecialties = new Set(
    s.waiting
      .filter((entry) => entry.status === "Waiting")
      .map((entry) => entry.specialty),
  ).size;
  const urgentReferrals = s.referrals.filter(
    (referral) =>
      referral.urgency !== "Routine" && referral.status === "Needs Review",
  );
  const matchedCancellations = s.appointments.filter(
    (appointment) =>
      appointment.status === "Cancelled" &&
      s.waiting.some(
        (entry) =>
          entry.status === "Waiting" &&
          entry.specialty === appointment.specialty,
      ),
  );
  const attention = [
    ...(atRisk
      ? [
          {
            tone: "danger",
            level: "HIGH",
            title: `${atRisk} active admission${atRisk === 1 ? "" : "s"} have blocked discharge dependencies`,
            meta:
              blocks.map((item) => `${item.n} ${item.v}`).join(" Â· ") ||
              "Clinical coordination required",
          },
        ]
      : []),
    ...urgentReferrals.slice(0, 1).map((referral) => ({
      tone: "warning",
      level: "MEDIUM",
      title: `${referral.urgency} ${referral.service.toLowerCase()} referral awaiting review`,
      meta: `${referral.id} Â· ${referral.confidence}% AI confidence`,
    })),
    ...(matchedCancellations.length
      ? [
          {
            tone: "info",
            level: "INFO",
            title: `${matchedCancellations.length} cancelled slot${matchedCancellations.length === 1 ? "" : "s"} match waiting-list demand`,
            meta: `${new Set(matchedCancellations.map((item) => item.specialty)).size} matching specialties`,
          },
        ]
      : []),
  ].slice(0, 3);
  const kpis: [string, number, string, LucideIcon][] = [
    [
      "Patients Waiting",
      s.waiting.filter((w) => w.status === "Waiting").length,
      `Across ${waitingSpecialties} ${waitingSpecialties === 1 ? "specialty" : "specialties"}`,
      Users,
    ],
    [
      "Beds Available",
      available,
      `${s.beds.length - available} not currently available`,
      BedDouble,
    ],
    ["Expected Discharges", active.length, `${atRisk} at risk`, LogOut],
    [
      "Urgent Referrals",
      urgentReferrals.length,
      "Awaiting clinical review",
      FileWarning,
    ],
    [
      "Appointments Today",
      today,
      `${Math.min(100, Math.round((today / 8) * 100))}% demo clinic utilization`,
      CalendarDays,
    ],
    [
      "Medication Alerts",
      openInc,
      `${s.incidents.filter((i) => i.severity === "High").length} high severity`,
      Pill,
    ],
  ];
  return (
    <Page
      title="Hospital Operations"
      subtitle="Real-time operational overview across patient flow, referrals, capacity and patient safety."
    >
      <div className="updated">
        Last updated just now · All data is synthetic
      </div>
      <div className="kpis">
        {kpis.map(([n, v, d, I]) => (
          <Card key={n as string} className="kpi">
            <div className="kicon">
              <I />
            </div>
            <span>{n as string}</span>
            <strong>{v as number}</strong>
            <small>{d as string}</small>
          </Card>
        ))}
      </div>
      <div className="grid two">
        <Card>
          <div className="cardhead">
            <div>
              <h2>Patient flow & waiting demand</h2>
              <p>Seven-day operational trend</p>
            </div>
            <Badge>LIVE DEMO</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f6f9f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2f6f9f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="flow"
                stroke="#2f6f9f"
                fill="url(#flow)"
              />
              <Area
                type="monotone"
                dataKey="wait"
                stroke="#d99224"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <AIBox title="AI Operational Insight">
          <h3>{atRisk} patients are at risk of delayed discharge</h3>
          <p>
            {blocks.length
              ? `${blocks
                  .slice(0, 2)
                  .map((item) => item.n)
                  .join(
                    " and ",
                  )} are the leading unresolved contributors across active admissions.`
              : "No unresolved discharge dependencies are currently recorded."}
          </p>
          <div className="airows">
            {blocks.slice(0, 3).map((item) => (
              <span key={item.n}>
                {item.n} <b>{item.v}</b>
              </span>
            ))}
          </div>
          <a href="/patient-flow" className="textlink">
            Review affected patients <ArrowUpRight size={15} />
          </a>
        </AIBox>
      </div>
      <div className="grid two">
        <Card>
          <div className="cardhead">
            <div>
              <h2>Discharge blockers</h2>
              <p>Open dependencies by service</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={blocks}
              layout="vertical"
              margin={{ top: 4, right: 12, bottom: 4, left: 18 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="n"
                type="category"
                width={112}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="v" fill="#2a8c82" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="cardhead">
            <div>
              <h2>Operational attention</h2>
              <p>Prioritized tasks across the facility</p>
            </div>
          </div>
          <div className="attention">
            {attention.length ? (
              attention.map((item) => (
                <div key={`${item.level}-${item.title}`}>
                  <Badge tone={item.tone}>{item.level}</Badge>
                  <span>{item.title}</span>
                  <small>{item.meta}</small>
                </div>
              ))
            ) : (
              <div>
                <Badge tone="success">CLEAR</Badge>
                <span>No priority operational exceptions</span>
                <small>Shared workflow state is currently within target.</small>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
