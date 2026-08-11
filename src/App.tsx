import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Users,
  FileInput,
  CalendarDays,
  Clock3,
  Pill,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Plug,
  Settings,
  Search,
  Bell,
  ChevronsUpDown,
} from "lucide-react";
import { useStore } from "./store";
import { canAccess } from "./permissions";
import { Card, Page } from "./components";

const groups = [
  [
    "CARE MANAGEMENT",
    [
      ["Patients", "/patients", Users],
      ["Referrals", "/referrals", FileInput],
      ["Appointments", "/appointments", CalendarDays],
      ["Waiting List", "/waiting-list", Clock3],
      ["Patient Flow", "/patient-flow", Activity],
    ],
  ],
  [
    "PATIENT SAFETY",
    [
      ["Medication & ADR", "/medication", Pill],
      ["Safety Analytics", "/safety-analytics", ShieldAlert],
    ],
  ],
  [
    "AI & INTELLIGENCE",
    [
      ["AI Copilot", "/copilot", Sparkles],
      ["AI Insights", "/ai-insights", HeartPulse],
      ["Population Health", "/population", Users],
    ],
  ],
  ["PATIENT EXPERIENCE", [["Patient Portal", "/portal", HeartPulse]]],
  [
    "SYSTEM",
    [
      ["Integrations", "/integrations", Plug],
      ["Settings", "/settings", Settings],
    ],
  ],
] as const;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  const [search, setSearch] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchNow = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim())
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span>+</span>
          <div>
            CareOps AI<small>Clinical Operations</small>
          </div>
        </div>
        <NavLink className="overview" to="/" end>
          <Activity />
          Overview
        </NavLink>
        {groups.map(([group, items]) => (
          <div className="navgroup" key={group}>
            <label>{group}</label>
            {items
              .filter(([, to]) => canAccess(store.role, to))
              .map(([name, to, Icon]) => (
                <NavLink key={to} to={to}>
                  <Icon />
                  {name}
                </NavLink>
              ))}
          </div>
        ))}
        <div className="demo">
          ● DEMO ENVIRONMENT<small>Synthetic data only</small>
        </div>
      </aside>
      <main>
        <header className="top">
          <label className="facility">
            <HeartPulse />
            <select
              aria-label="Facility"
              value={store.facility}
              onChange={(e) => store.setFacility(e.target.value)}
            >
              <option>St. Anne Medical Centre</option>
              <option>Riverside Community Hospital</option>
              <option>Northgate Ambulatory Centre</option>
            </select>
            <ChevronsUpDown />
          </label>
          <form className="globalsearch" onSubmit={searchNow}>
            <Search />
            <input
              aria-label="Global search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients, referrals, tasks…"
            />
          </form>
          <div className="popoverwrap">
            <button
              className="iconbtn"
              aria-label="Notifications"
              aria-expanded={showAlerts}
              onClick={() => {
                setShowAlerts(!showAlerts);
                setShowProfile(false);
              }}
            >
              <Bell />
              {store.alerts.some((a) => !a.read) && (
                <i>{store.alerts.filter((a) => !a.read).length}</i>
              )}
            </button>
            {showAlerts && (
              <div className="popover">
                <header>
                  <b>Notifications</b>
                  <button onClick={store.markAlertsRead}>Mark all read</button>
                </header>
                {store.alerts.map((a) => (
                  <button
                    onClick={() => {
                      navigate(a.href);
                      setShowAlerts(false);
                    }}
                  >
                    <b>{a.title}</b>
                    <span>{a.body}</span>
                    <small>{a.at}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="profilebutton"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowAlerts(false);
            }}
            aria-expanded={showProfile}
          >
            <div className="avatar">MC</div>
            <div className="profile">
              Maya Chen<small>{store.role}</small>
            </div>
          </button>
          {showProfile && (
            <div className="popover profilepop">
              <b>Demo profile</b>
              <span>Maya Chen</span>
              <small>{store.facility}</small>
              <NavLink to="/settings" onClick={() => setShowProfile(false)}>
                Settings & role
              </NavLink>
            </div>
          )}
        </header>
        <div className="content" key={location.pathname}>
          {canAccess(store.role, location.pathname) ? (
            <Outlet />
          ) : (
            <Page
              title="Access restricted"
              subtitle={`The ${store.role} demo role cannot access this module.`}
            >
              <Card>
                <p>Switch role in Settings or return to an available module.</p>
                <NavLink
                  className="btn"
                  to={store.role === "Patient" ? "/portal" : "/"}
                >
                  Return to allowed workspace
                </NavLink>
              </Card>
            </Page>
          )}
        </div>
      </main>
    </div>
  );
}
