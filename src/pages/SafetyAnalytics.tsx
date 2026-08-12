import { useMemo, useState } from "react";
import { useStore } from "../store";
import { Page, Card, Badge, Empty, Select } from "../components";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
export function SafetyAnalytics() {
  const incidents = useStore((s) => s.incidents),
    actions = useStore((s) => s.correctiveActions);
  const [range, setRange] = useState("90"),
    [ward, setWard] = useState("All"),
    [severity, setSeverity] = useState("All"),
    [medication, setMedication] = useState("All"),
    [type, setType] = useState("All");
  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        const within =
          (+new Date("2026-08-11") - +new Date(i.at)) / 86400000 <=
          Number(range);
        return (
          within &&
          (ward === "All" || i.ward === ward) &&
          (severity === "All" || i.severity === severity) &&
          (medication === "All" || i.medication === medication) &&
          (type === "All" || i.type === type)
        );
      }),
    [incidents, range, ward, severity, medication, type],
  );
  const group = (key: "severity" | "medication" | "ward" | "type") =>
    Object.entries(
      filtered.reduce<Record<string, number>>(
        (a, i) => ({ ...a, [i[key]]: (a[i[key]] || 0) + 1 }),
        {},
      ),
    ).map(([n, v]) => ({ n, v }));
  const trend = Object.entries(
    filtered.reduce<Record<string, number>>((a, i) => {
      const n = i.at.slice(0, 7);
      return { ...a, [n]: (a[n] || 0) + 1 };
    }, {}),
  )
    .sort()
    .map(([n, v]) => ({ n, v }));
  return (
    <Page
      title="Safety Analytics"
      subtitle={`${filtered.length} matching records from shared medication and ADR state.`}
    >
      <div className="filterbar">
        <label>
          Period
          <Select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
        </label>
        <label>
          Ward
          <Select value={ward} onChange={(e) => setWard(e.target.value)}>
            <option>All</option>
            {[...new Set(incidents.map((i) => i.ward))].map((x) => (
              <option>{x}</option>
            ))}
          </Select>
        </label>
        <label>
          Severity
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option>All</option>
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
          </Select>
        </label>
        <label>
          Medication
          <Select
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          >
            <option>All</option>
            {[...new Set(incidents.map((i) => i.medication))].map((x) => (
              <option>{x}</option>
            ))}
          </Select>
        </label>
        <label>
          Type
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option>All</option>
            {[...new Set(incidents.map((i) => i.type))].map((x) => (
              <option>{x}</option>
            ))}
          </Select>
        </label>
      </div>
      <div className="summaryrow">
        <Card>
          <strong>{filtered.length}</strong>
          <span>Matching events</span>
        </Card>
        <Card>
          <strong>
            {filtered.filter((i) => i.type === "Adverse Drug Reaction").length}
          </strong>
          <span>ADR reports</span>
        </Card>
        <Card>
          <strong>
            {
              filtered.filter((i) => i.status === "Awaiting Safety Review")
                .length
            }
          </strong>
          <span>Open reviews</span>
        </Card>
        <Card>
          <strong>
            {actions.filter((a) => a.status !== "Completed").length}
          </strong>
          <span>Open corrective actions</span>
        </Card>
      </div>
      {filtered.length ? (
        <>
          <div className="grid two safetyanalyticsgrid">
            <Card>
              <h2>Incidents by severity</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={group("severity")}
                    dataKey="v"
                    nameKey="n"
                    innerRadius={50}
                    outerRadius={85}
                    label
                  >
                    {group("severity").map((_, x) => (
                      <Cell
                        key={x}
                        fill={["#238a63", "#d99224", "#c84a4a"][x % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h2>Incidents by medication</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={group("medication")}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="n" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="v" fill="#2f6f9f" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid two safetyanalyticsgrid">
            <Card>
              <h2>Incidents by ward</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={group("ward")}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="n" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="v" fill="#2a8c82" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h2>Incidents by type</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={group("type")}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="n" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="v" fill="#6750a4" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="grid two safetyanalyticsgrid">
            <Card>
              <h2>Safety trend</h2>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line dataKey="v" stroke="#2a8c82" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h2>Corrective actions</h2>
              {actions.length ? (
                <div className="correctiveactionlist">
                  {actions.map((a) => (
                    <article className="correctiveaction" key={a.id}>
                      <div className="correctiveactionhead">
                        <div>
                          <b>{a.action}</b>
                          <small>{a.rootCause}</small>
                        </div>
                        <Badge
                          tone={a.status === "Completed" ? "success" : "warning"}
                        >
                          {a.status}
                        </Badge>
                      </div>
                      <div className="correctiveactionfields">
                        <label>
                          <span>Owner</span>
                          <input
                            aria-label={`Owner for ${a.action}`}
                            value={a.owner}
                            onChange={(e) => {
                              if (
                                !useStore
                                  .getState()
                                  .updateCorrectiveAction(a.id, {
                                    owner: e.target.value,
                                  })
                              )
                                return;
                            }}
                          />
                        </label>
                        <label>
                          <span>Due date</span>
                          <strong>{a.due}</strong>
                        </label>
                        <label>
                          <span>Status</span>
                          <Select
                            aria-label={`Status for ${a.action}`}
                            value={a.status}
                            onChange={(e) => {
                              if (
                                !useStore
                                  .getState()
                                  .updateCorrectiveAction(a.id, {
                                    status: e.target.value as typeof a.status,
                                  })
                              )
                                return;
                            }}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </Select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty text="No corrective actions match the current demo state." />
              )}
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <Empty text="No safety records match these filters." />
        </Card>
      )}
    </Page>
  );
}
