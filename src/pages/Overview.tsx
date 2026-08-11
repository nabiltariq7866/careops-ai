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
  ],
  blocks = [
    { n: "Pharmacy", v: 4 },
    { n: "Transport", v: 2 },
    { n: "Diagnostics", v: 3 },
    { n: "Community care", v: 1 },
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
  const kpis: [string, number, string, LucideIcon][] = [
    [
      "Patients Waiting",
      s.waiting.filter((w) => w.status === "Waiting").length,
      "Across 6 specialties",
      Users,
    ],
    [
      "Beds Available",
      available,
      `${s.beds.length - available} currently occupied`,
      BedDouble,
    ],
    ["Expected Discharges", active.length, `${atRisk} at risk`, LogOut],
    [
      "Urgent Referrals",
      s.referrals.filter(
        (r) => r.urgency !== "Routine" && r.status === "Needs Review",
      ).length,
      "Awaiting clinical review",
      FileWarning,
    ],
    ["Appointments Today", today, "87% clinic utilization", CalendarDays],
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
            Unresolved pharmacy and diagnostics dependencies are the leading
            contributors across active admissions.
          </p>
          <div className="airows">
            <span>
              Pharmacy <b>4</b>
            </span>
            <span>
              Diagnostics <b>3</b>
            </span>
            <span>
              Transport <b>2</b>
            </span>
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={blocks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="n" type="category" width={100} />
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
            <div>
              <Badge tone="danger">HIGH</Badge>
              <span>Ward 4B discharge blockers require review</span>
              <small>2 patients · updated 4 min ago</small>
            </div>
            <div>
              <Badge tone="warning">MEDIUM</Badge>
              <span>Urgent neurology referral awaiting review</span>
              <small>Received today · 92% AI confidence</small>
            </div>
            <div>
              <Badge tone="info">INFO</Badge>
              <span>Cardiology cancellation could match waiting list</span>
              <small>1 suitable patient identified</small>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
