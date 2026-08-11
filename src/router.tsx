import { createBrowserRouter, Link } from "react-router-dom";
import AppLayout from "./App";
import { Card, Page } from "./components";

function NotFound() {
  return (
    <Page
      title="Page not found"
      subtitle="The requested CareOps route does not exist."
    >
      <Card>
        <Link className="btn" to="/">
          Return to Command Centre
        </Link>
      </Card>
    </Page>
  );
}
function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="spinner" />
      <span>Loading CareOps module…</span>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    HydrateFallback: RouteLoading,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        lazy: () =>
          import("./pages/Overview").then((m) => ({ Component: m.Overview })),
      },
      {
        path: "patients",
        lazy: () =>
          import("./pages/Patients").then((m) => ({ Component: m.Patients })),
      },
      {
        path: "patients/:id",
        lazy: () =>
          import("./pages/Patients").then((m) => ({
            Component: m.PatientDetail,
          })),
      },
      {
        path: "referrals",
        lazy: () =>
          import("./pages/Referrals").then((m) => ({ Component: m.Referrals })),
      },
      {
        path: "waiting-list",
        lazy: () =>
          import("./pages/WaitingList").then((m) => ({
            Component: m.WaitingList,
          })),
      },
      {
        path: "appointments",
        lazy: () =>
          import("./pages/Appointments").then((m) => ({
            Component: m.Appointments,
          })),
      },
      {
        path: "patient-flow",
        lazy: () =>
          import("./pages/PatientFlow").then((m) => ({
            Component: m.PatientFlow,
          })),
      },
      {
        path: "medication",
        lazy: () =>
          import("./pages/MedicationSafety").then((m) => ({
            Component: m.MedicationSafety,
          })),
      },
      {
        path: "safety-analytics",
        lazy: () =>
          import("./pages/SafetyAnalytics").then((m) => ({
            Component: m.SafetyAnalytics,
          })),
      },
      {
        path: "copilot",
        lazy: () =>
          import("./pages/Copilot").then((m) => ({ Component: m.Copilot })),
      },
      {
        path: "ai-insights",
        lazy: () =>
          import("./pages/AIInsights").then((m) => ({
            Component: m.AIInsights,
          })),
      },
      {
        path: "population",
        lazy: () =>
          import("./pages/More").then((m) => ({ Component: m.Population })),
      },
      {
        path: "portal",
        lazy: () =>
          import("./pages/More").then((m) => ({ Component: m.Portal })),
      },
      {
        path: "integrations",
        lazy: () =>
          import("./pages/More").then((m) => ({ Component: m.Integrations })),
      },
      {
        path: "settings",
        lazy: () =>
          import("./pages/More").then((m) => ({ Component: m.SettingsPage })),
      },
      {
        path: "search",
        lazy: () =>
          import("./pages/Search").then((m) => ({
            Component: m.SearchResults,
          })),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
