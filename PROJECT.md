You are a Senior Frontend Engineer, Product Architect, and Healthcare SaaS UI/UX Designer.

I am giving you reference documents/specifications for a portfolio product called **CareOps AI**.

Your first responsibility is to READ ALL PROVIDED DOCUMENTS AND EXISTING PROJECT FILES CAREFULLY before writing or changing any code.

Do not start coding based only on assumptions.

The documents contain the business concept, modules, workflows, AI features, healthcare integrations, and product direction. Use those documents as the primary source of truth together with the requirements below.

# PROJECT

Build:

**CareOps AI — Intelligent Healthcare Operations & Patient Safety Platform**

CareOps AI represents an intelligent operational layer that could integrate with existing hospital EHR/HIS systems.

However, for this portfolio version:

## THIS IS FRONTEND ONLY

There will be:

- No real backend.
- No Django.
- No Node backend.
- No PostgreSQL.
- No real hospital integrations.
- No real Epic integration.
- No real Oracle Health integration.
- No real FHIR server.
- No real clinical AI.
- No real patient data.

Everything must use realistic synthetic/demo data.

However, this must NOT look or behave like a static UI template.

The goal is to create a highly realistic, fully interactive frontend product simulation that we can demonstrate to healthcare clients.

The client should feel as if they are using a real healthcare operations platform.

Every important visible action should work through frontend state.

For example:

Add Patient
→ Modal opens
→ User completes form
→ Validation works
→ Save
→ Patient appears in table
→ Patient count updates
→ Patient becomes selectable in related workflows
→ Success toast appears.

This same principle must apply throughout the application.

# CORE PRINCIPLE

Do NOT build a collection of disconnected screens.

Build one interconnected frontend application where actions in one module affect relevant data in other modules.

Example:

Referral approved
→ patient moves to waiting list
→ appointment can be assigned
→ appointment appears in appointment calendar
→ reminder can be sent
→ attendance can later be recorded.

Another example:

Discharge blocker resolved
→ discharge readiness changes
→ patient can be discharged
→ bed becomes available
→ Command Centre metrics update.

Another example:

Medication incident approved
→ incident count increases
→ similar incidents are grouped
→ Safety Analytics updates
→ recurring-pattern insight appears.

Everything is simulated, but the workflow must feel real.

---

# RECOMMENDED TECHNOLOGY STACK

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI where appropriate
- React Router
- Zustand for shared application state
- localStorage or IndexedDB for demo persistence
- React Hook Form
- Zod
- TanStack Table
- FullCalendar or another suitable professional calendar component
- Recharts
- Framer Motion only where useful
- Lucide React
- Sonner for notifications/toasts
- date-fns

Do NOT introduce a backend.

Do NOT introduce unnecessary complexity.

If an equivalent library already exists inside the current project, inspect it first and reuse it when appropriate rather than unnecessarily installing duplicates.

---

# BEFORE CODING

First inspect:

1. All provided reference documents.
2. Existing source code.
3. package.json.
4. Existing routing.
5. Existing global styles.
6. Existing components.
7. Existing state management.
8. Existing design system.
9. Existing mock/demo data.
10. Existing reusable tables/forms/modals/charts.

Before implementing major changes, understand what already exists.

Preserve good existing implementation.

Refactor where necessary instead of duplicating functionality.

Do not destroy working functionality unnecessarily.

---

# PRODUCT ARCHITECTURE

CareOps AI should visually and functionally represent these layers:

## 1. Patient Experience

- Patient Portal
- Mobile-ready experience
- Appointment booking
- Rescheduling
- Cancellation
- Forms
- Documents
- Communication
- Virtual Care concept

## 2. Care Management

- Patient Management
- Referrals
- Appointments
- Waiting Lists
- Patient Flow
- Admissions
- Bed Management
- Discharge
- Medication
- ADR
- Tasks

## 3. AI Layer

Simulated AI capabilities:

- AI Referral/Triage Assistant
- Clinical Copilot
- Ambient Documentation simulation
- Medical Record Summarisation
- No-show Prediction
- Readmission Risk
- Discharge Prediction
- Medication Safety Intelligence
- Population Health
- Operational AI Insights

## 4. Healthcare Data Layer

Represent:

- FHIR
- HL7
- APIs
- Events
- Documents

## 5. External Systems

Simulate integration visibility for:

- Epic
- Oracle Health
- Dedalus
- Labs
- Imaging
- Pharmacy
- Insurance
- Medical Devices

Clearly label them as demo/simulated connections where necessary.

Do not falsely claim a real integration is active.

---

# MAIN APPLICATION NAVIGATION

Use a professional enterprise healthcare sidebar.

Suggested structure:

CAREOPS AI

Overview

CARE MANAGEMENT
- Patients
- Referrals
- Appointments
- Waiting List
- Patient Flow

PATIENT SAFETY
- Medication & ADR
- Safety Analytics

AI & INTELLIGENCE
- AI Copilot
- AI Insights
- Population Health

PATIENT EXPERIENCE
- Patient Portal

SYSTEM
- Integrations
- Settings

You may improve naming or grouping when UX requires it, but preserve all important modules.

---

# APPLICATION SHELL

Create a polished persistent application shell.

## Sidebar

Dark clinical navy.

Must include:

- CareOps AI logo/wordmark
- Grouped navigation
- Active navigation state
- Icons
- Collapsible behavior if appropriate
- Responsive behavior

## Top Navigation

White/light surface.

Include:

- Current page/title or breadcrumb
- Facility selector
- Global search
- AI alerts
- Notifications
- User profile

Example facility:

St. Anne Medical Centre

Use realistic fictional healthcare organizations only.

---

# DESIGN SYSTEM

The application must look like a serious modern healthcare enterprise product.

It should NOT look like:

- Generic admin template
- Crypto dashboard
- Cyberpunk AI product
- Neon SaaS
- Marketing website
- Overly colorful startup dashboard

Visual direction:

Clean.
Calm.
Trustworthy.
Modern.
Clinical.
Premium.
Operational.
Information-dense but readable.

Think:

Modern hospital operations software + polished enterprise SaaS.

---

# COLOR PALETTE

Use approximately:

Primary Clinical Navy:
#16324F

Healthcare Blue:
#2F6F9F

Teal Accent:
#2A8C82

App Background:
#F5F8FA

Cards:
#FFFFFF

Borders:
#DCE5EA

Main Text:
#1B2733

Secondary Text:
#667784

Semantic colors:

Success:
#238A63

Warning:
#D99224

Critical:
#C84A4A

Information:
#3478B8

AI Accent:
#6750A4

AI Light Background:
#F4F1FA

AI Border:
#DDD4F2

Do not make the application purple.

Purple is reserved only for subtle AI-generated or AI-assisted elements.

---

# COLOR USAGE RULES

Approximately:

80% light neutral/white
15% clinical blue/navy
5% teal + semantic colors

Do not assign random colors to every dashboard card.

Use semantic color intentionally.

Examples:

Green:
completed, safe, successful.

Amber:
needs attention.

Red:
critical/high risk.

Blue:
standard operational state.

Purple:
AI-generated recommendation or analysis.

---

# TYPOGRAPHY

Prefer:

Inter

If already unavailable or another equivalent font exists, use a professional alternative.

Suggested scale:

Page title:
26–30px, semibold

Section heading:
18–20px

Body:
14px

Tables:
13–14px

Labels:
12–13px

Major KPI values:
28–34px

Avoid giant marketing typography.

---

# COMPONENT STYLE

Cards:

- White
- subtle border
- subtle shadow if needed
- approximately 10–12px radius

Buttons:

- approximately 8px radius
- strong hierarchy between primary/secondary/destructive

Avoid excessive pill-shaped UI.

Tables must be professional and relatively dense.

Use:

- hover states
- selected states
- empty states
- loading states
- skeletons
- tooltips
- contextual menus
- confirmation dialogs
- toasts
- badges
- breadcrumbs where relevant

---

# GLOBAL DEMO DATA

Create realistic synthetic data for:

- Patients
- Doctors
- Nurses
- Care Coordinators
- Safety Officers
- Departments
- Specialties
- Referrals
- Appointments
- Waiting-list entries
- Hospital wards
- Beds
- Admissions
- Encounters
- Tasks
- Discharge dependencies
- Medications
- Medication incidents
- ADR reports
- Documents
- AI insights
- Notifications
- Integration events

Do not use ridiculous placeholder data such as:

John Doe everywhere,
Lorem ipsum,
Test User 1,
ABC Patient.

Use realistic fictional names and operational records.

Never use real patient information.

---

# SHARED FRONTEND STATE

Use a clean centralized state architecture.

At minimum, relevant stores should handle:

- patients
- referrals
- appointments
- waiting list
- admissions
- beds
- discharge tasks
- medication incidents
- notifications
- AI insights

Do not hardcode changing data directly inside individual components.

Actions should update the shared state.

Use localStorage/IndexedDB persistence so the demo does not reset unnecessarily on page reload.

Also provide a clearly visible way inside Settings or Demo Controls to:

"Reset Demo Data"

This returns the application to the original seeded state.

---

# MODULE 1 — OPERATIONAL COMMAND CENTRE

This should be one of the strongest screens.

Page:

Overview / Command Centre

Top heading example:

Hospital Operations

Subtitle:

Real-time operational overview across patient flow, referrals, capacity and patient safety.

Show realistic KPI cards such as:

Patients Waiting
Beds Available
Expected Discharges
Discharges At Risk
Urgent Referrals
Appointments Today
No-show Rate
Medication Incidents
Critical Alerts

Example:

Patients Waiting
127
+8 since morning

Beds Available
34
12 ICU / 22 General

Expected Discharges
26
8 at risk

Critical Referrals
7
3 awaiting review

Medication Alerts
4
1 high severity

Use realistic synthetic numbers.

Metrics should derive from the demo state where practical.

If a workflow changes relevant state, corresponding dashboard values should update.

---

# COMMAND CENTRE VISUALS

Include useful operational charts such as:

- Patient flow trend
- Waiting-list trend
- Bed occupancy
- Clinic utilization
- Appointment attendance
- No-show trend
- Discharge blockers
- Medication incidents
- Safety trends

Do not create excessive charts just for decoration.

Charts must answer an operational question.

---

# AI OPERATIONAL INSIGHTS

Add a dedicated AI insight panel.

Example:

AI Operational Insight

8 patients are currently at risk of delayed discharge.

Primary blockers:
- Pharmacy: 4
- Transport: 2
- Diagnostics: 2

Review Patients

Use consistent AI styling.

AI output must clearly be labelled:

AI-generated insight

or:

AI-assisted recommendation

When appropriate, show:

Requires human review.

---

# MODULE 2 — PATIENT MANAGEMENT

Create a complete Patient Management area.

## Patient List

Include:

Search
Filters
Sort
Status
Ward
Age/DOB
Patient ID
Primary care team if useful
Actions

Columns may include:

Patient
Patient ID
DOB
Age
Gender
Contact
Current Ward
Care Status
Last Activity
Actions

Actions:

View
Edit
Book Appointment
Add Task
Archive/Delete if appropriate for demo

---

# ADD PATIENT

Add Patient button must work.

Click:

+ Add Patient

Open proper modal/drawer.

Fields may include:

Personal Information
- First name
- Last name
- Date of birth
- Sex
- Preferred language

Contact
- Phone
- Email
- Address

Identifiers
- Hospital ID
- National/External ID

Emergency Contact

Consent
- SMS
- Email
- Patient portal
- Data sharing preference

Validate form.

On save:

- Add patient to shared store
- Generate realistic patient ID if needed
- Patient appears immediately
- Dashboard patient count can update where relevant
- Show success notification

---

# EDIT PATIENT

Must actually update frontend state.

---

# DUPLICATE PATIENT DETECTION

Simulate duplicate detection.

If a user enters data similar to an existing patient, show:

Possible duplicate patient detected.

Example:

92% potential match

Existing patient:
Muhammad Ali
DOB...
Phone...

Actions:

Review Existing
Continue Anyway
Cancel

Do not automatically merge.

---

# PATIENT PROFILE

Create a rich patient detail view.

Header example:

JS

John Smith

P-10024 • Male • 58 years

Cardiology

Status: Active

Actions:

Book Appointment
Add Task
Add Note
More

Tabs:

Overview
Timeline
Appointments
Referrals
Medications
Documents
Tasks

---

# PATIENT OVERVIEW

Cards:

Patient Information
Medical Identifiers
Consent & Preferences
Current Care
Recent Encounters
Open Tasks

Include AI Patient Summary panel.

---

# PATIENT TIMELINE

Create chronological timeline with items such as:

Patient registered
Referral received
Referral approved
Appointment booked
Encounter completed
Medication updated
Discharge planned
Document uploaded

Entries should contain:

timestamp
user/system source
event type
summary

---

# MODULE 3 — REFERRAL MANAGEMENT

Create a realistic Referral Inbox.

Left filters/sidebar or tabs:

All
Needs Review
Urgent
Incomplete
Approved
Waiting List
Rejected

Main table:

Patient
Referral Source
Requested Service
AI Suggested Specialty
AI Priority
Status
Received
Actions

---

# CREATE REFERRAL

Provide:

New Referral

Possible methods:

- Manual Referral
- Upload Referral Document

All simulated frontend-only.

---

# AI REFERRAL ASSISTANT

This is a key portfolio feature.

The demo should allow a user to select/upload a referral PDF or demo document.

No actual clinical AI API is required.

Provide realistic simulated processing.

On:

Analyze with AI

show staged progress:

Reading document...
Extracting patient information...
Reviewing referral context...
Identifying specialty...
Assessing urgency...
Checking missing information...
Preparing recommendation...

Then show a structured result.

Example:

Patient:
John Smith

DOB:
04 March 1968

Suggested Specialty:
Cardiology

Suggested Urgency:
Urgent

Confidence:
94%

Referral Reason:
Chest pain and exertional discomfort.

Missing Information:
- Recent ECG
- Current medication list

Suggested Routing:
Rapid Access Cardiology Clinic

Display:

AI-assisted recommendation.
Clinical review required.

Actions:

Approve
Modify
Reject

---

# REFERRAL APPROVAL WORKFLOW

Approve must actually do something.

When approved:

- Change referral status
- Create/update patient if appropriate
- Add patient to correct waiting list
- Generate timeline event
- Show success toast
- Update relevant dashboard metrics

Do not only change button appearance.

---

# MODIFY REFERRAL

Allow staff to modify:

Specialty
Urgency
Routing
Missing information
Notes

Record in frontend state.

Show comparison where useful:

AI Suggested:
Cardiology

Staff Decision:
Cardiology

or:

AI Suggested:
General Medicine

Staff Decision:
Cardiology

This demonstrates human oversight.

---

# MODULE 4 — WAITING LIST MANAGEMENT

Create operational waiting-list screen.

Columns:

Patient
Specialty
Priority
Waiting Since
Days Waiting
Target
Breach Risk
Missing Information
Suggested Slot
Actions

Risk:

Low
Medium
High

---

# AI WAITING LIST FEATURES

Simulate:

- Detect long-wait patients
- Breach-risk detection
- Detect missing referral information
- Recommend available appointments
- Detect cancellations
- No-show prediction
- Prioritize administrative follow-up

---

# FIND OPTIMAL APPOINTMENT

A row should include:

Find Optimal Slot

Click opens AI recommendation.

Example:

Recommended Appointment

Dr. Sarah Wilson
Cardiology

13 August 2026
10:30 AM

Location:
Cardiology Clinic 2

Why this slot:
- Earliest suitable appointment
- Matches referral specialty
- Appropriate urgency
- Patient preference matched
- No scheduling conflict

Actions:

Assign Appointment
View Alternatives
Cancel

Assign must:

- create appointment
- update waiting-list status
- add appointment to calendar
- create timeline event
- optionally generate reminder
- update metrics

---

# MODULE 5 — APPOINTMENT MANAGEMENT

Create:

Calendar view
List view

Use realistic professional scheduling UI.

Support:

- doctor calendars
- service calendars
- booking
- rescheduling
- cancellation
- attendance
- reminders
- patient details
- appointment type
- location
- duration
- status

---

# BOOK APPOINTMENT

Click appointment slot or Book Appointment.

Modal fields:

Patient
Specialty
Practitioner
Date
Time
Duration
Location
Appointment Type
Notes

Save.

Appointment appears in calendar.

---

# RESCHEDULE

Must update appointment.

Show confirmation.

---

# CANCEL

Use confirmation dialog.

Allow optional cancellation reason.

If cancelled:

- appointment slot becomes available
- appointment status updates
- optionally trigger "Potential Waiting List Match" insight.

---

# ATTENDANCE

Statuses:

Scheduled
Confirmed
Arrived
In Progress
Completed
No-show
Cancelled

Changing attendance should update relevant metrics.

---

# REMINDERS

Provide:

Send Reminder

Simulated states:

Sending...
Sent successfully.

Update:

Last Reminder:
Today, 14:32

Channels:

SMS
Email
Patient Portal

These are simulations only.

---

# MODULE 6 — PATIENT FLOW

Create a major Patient Flow area.

Tabs:

Board
Beds
Discharge
Tasks

---

# ADMISSIONS

Allow:

Admit Patient

Fields:

Patient
Ward
Bed
Consultant
Admission Reason
Admission Date
Expected Discharge Date

On save:

- admission created
- bed becomes occupied
- patient status becomes admitted
- dashboard bed availability updates

---

# BED MANAGEMENT

Show wards.

Example:

Ward 4B
21 / 24 occupied

Bed statuses:

Occupied
Available
Cleaning
Reserved
Unavailable

Use professional small cards/table rather than giant colored blocks.

Each occupied bed can show:

Patient
Age
Care status
Expected discharge
Alerts

---

# EXPECTED DISCHARGE

Each admitted patient can have:

Expected Discharge Date

AI simulated prediction can show:

Predicted Discharge:
Tomorrow

Confidence:
82%

Status:

On Track
At Risk
Delayed

---

# DISCHARGE CHECKLIST

Dependencies:

Clinical Review
Diagnostics
Pharmacy
Discharge Letter
Transport
Community Care
Follow-up
Patient Education

Each can be:

Complete
Pending
Blocked
Not Required

---

# AI DISCHARGE DELAY PREDICTION

Example:

AI Delay Prediction

High risk of delayed discharge.

Likely blockers:

1. Pharmacy medication incomplete
2. Patient transport not confirmed

AI-generated operational recommendation.
Care coordinator review required.

---

# RESOLVE BLOCKER

Each blocker should have actions such as:

Assign
Mark In Progress
Resolve

When resolved:

- discharge readiness percentage updates
- AI delay risk updates
- dashboard blocker counts update

When all required blockers complete:

Show:

Discharge Ready

Button:

Discharge Patient

---

# DISCHARGE PATIENT

Click:

- patient status becomes discharged
- admission closes
- bed becomes available
- patient timeline updates
- command centre metrics update
- success confirmation appears

---

# MODULE 7 — MEDICATION ERROR & ADR MANAGEMENT

Create a complete Medication Safety area.

Top metrics:

Incidents This Month
Open Reviews
High Severity
Recurring Patterns
ADR Reports

---

# REPORT MEDICATION INCIDENT

Button:

+ Report Incident

Modal fields:

Patient
Medication
Prescribed Dose
Administered Dose
Route
Date/Time
Error Type
Description
Immediate Patient Outcome
Reported By

Allow user to simply enter free-text incident narrative as well.

---

# SIMULATED AI INCIDENT EXTRACTION

Example user narrative:

"Patient was given 10mg instead of the prescribed 5mg at 8 PM. No immediate harm observed."

Analyze with AI

Processing:

Extracting medication...
Identifying dosage...
Classifying event...
Assessing severity...
Checking similar incidents...

Result:

Medication:
Example Medication

Prescribed Dose:
5mg

Administered Dose:
10mg

Error Type:
Wrong Dose

Time:
20:00

Severity:
Moderate

Patient Harm:
None observed

Suggested Classification:
Medication Administration Error

Actions:

Approve Extraction
Edit
Cancel

---

# SAFETY OFFICER REVIEW

Once submitted:

Status:
Awaiting Safety Review

Safety officer can:

Approve
Request More Information
Edit Classification
Close

---

# INCIDENT GROUPING

After approval, simulate:

Similar Incidents Detected:
6

Allow:

View Similar Incidents

Group based on mock factors such as:

- same medication
- same ward
- similar error type
- similar time period

---

# RECURRING PATTERN DETECTION

Show AI safety insight.

Example:

Recurring medication safety pattern detected.

7 wrong-dose incidents involving the same medication occurred in Ward B during the last 45 days.

5 occurred during evening medication rounds.

Recommendation:
Safety review recommended.

Do NOT present AI conclusions as absolute clinical truth.

---

# ROOT CAUSE & CORRECTIVE ACTIONS

Safety officer can record:

Potential Root Cause
Contributing Factors
Corrective Action
Owner
Due Date
Status

Examples:

Medication packaging similarity
Manual transcription
Shift workload
Process issue
Training requirement

---

# MODULE 8 — SAFETY ANALYTICS

Dashboard charts:

Incidents by type
Incidents by severity
Incidents by ward
Incidents over time
Medication-specific incidents
ADR trend
Open investigations
Corrective actions

Allow filtering by:

Date
Ward
Severity
Medication
Incident Type

---

# MODULE 9 — AI HEALTHCARE COPILOT

Create a polished AI Copilot interface.

This is simulated.

Do NOT call a real clinical model unless project documents explicitly require it later.

The UI should demonstrate how AI assistance could work.

Features:

- Patient record summarization
- Clinical-note draft generation
- Referral summarization
- Document summarization
- Policy/SOP Q&A
- Draft discharge letters
- Draft patient communication
- Extract open actions
- Source citations

---

# COPILOT CONTEXT

Allow selecting:

Patient
Referral
Admission
Document
Policy

Example prompts:

Summarize this patient record.

What actions are still outstanding?

Summarize the latest referral.

Draft a discharge letter.

Explain the hospital policy for medication incidents.

---

# COPILOT RESPONSES

Use predefined/context-aware demo responses generated from mock frontend data.

Do not return identical canned content for every patient.

Where possible, construct responses dynamically from the selected patient's mock state.

---

# COPILOT CITATIONS

Show source references.

Example:

Sources

Cardiology Note
10 Aug 2026

Lab Result
09 Aug 2026

Referral Document
07 Aug 2026

Make it visually obvious that claims came from source documents.

---

# AI SAFETY LABEL

Throughout AI modules, use language such as:

AI-generated draft.

Requires review before use.

AI-assisted recommendation.

Not a diagnosis.

Human approval required.

The AI should not automatically diagnose or prescribe.

---

# AMBIENT DOCUMENTATION DEMO

Create a simulated workflow.

Example:

Start Demo Consultation

Display fictional transcript snippets.

Then:

Generate Clinical Note

AI processes.

Output sections:

Chief Complaint
History
Assessment Notes
Actions
Follow-up

Allow:

Edit
Approve Draft
Discard

Clearly label:

AI-generated documentation draft.

---

# MODULE 10 — POPULATION HEALTH

Create population-level dashboard.

Use synthetic data.

Examples:

Patients with overdue follow-up
High no-show cohort
Patients with repeated admissions
Care gaps
Chronic-condition follow-up
Preventive-care status

Allow filters:

Age group
Condition
Department
Risk
Last contact

AI insights may say:

187 patients with diabetes have overdue follow-up.

Do not use real clinical predictions.

---

# MODULE 11 — PATIENT PORTAL

Create a separate patient-facing experience while remaining inside the demo.

Can either use:

Switch to Patient Portal

or dedicated route.

Patient portal functionality:

Dashboard
Appointments
Forms
Documents
Messages
Consent
Preferences
Profile

---

# PATIENT PORTAL DASHBOARD

Show:

Next Appointment
Tasks to Complete
Recent Documents
Messages
Reminders

---

# PATIENT APPOINTMENTS

Patient can:

Book
Reschedule
Cancel

Changes should update the shared appointment state where practical.

---

# PATIENT FORMS

Example:

Pre-appointment Form
Medical History
Consent Form
Contact Details

Completing form changes status to completed.

---

# DOCUMENT UPLOAD

Simulate file upload.

Show uploaded document in patient documents.

Examples:

External Report
Referral
Lab Report

No backend required.

Use browser/local state only.

---

# SECURE MESSAGING

Simulate conversation between:

Patient
Care Team

Allow sending new messages.

Frontend state only.

---

# MODULE 12 — FHIR / EHR INTEGRATIONS

Create an impressive Integrations screen.

Goal:

Show that CareOps is designed to sit above existing healthcare systems.

Systems:

Epic
Oracle Health
Dedalus
Laboratory System
Imaging/PACS
Pharmacy
Insurance
Medical Devices

Statuses:

Connected
Syncing
Attention Required
Disconnected
Demo Connector

Because this is not actually integrated, use language such as:

Demo Connection

Simulated Integration

Integration Ready

Do NOT claim live Epic connectivity.

---

# DATA FLOW VISUALIZATION

Represent:

External EHR
↕
FHIR / HL7 / API Layer
↕
CareOps AI
↕
Operational Workflows

Include resources such as:

Patient
Practitioner
Appointment
Encounter
Observation
Condition
Medication
AllergyIntolerance
DocumentReference
Task
CarePlan
Provenance

---

# FHIR RESOURCE EXPLORER

Optional but strongly recommended.

Show realistic FHIR-style demo records.

Example:

resourceType:
Patient

id:
P-10024

name
birthDate
identifier
telecom

Another:

Appointment

Another:

Encounter

Allow:

View JSON

Do not need real API.

---

# INTEGRATION EVENT LOG

Show realistic events:

Patient.updated
Referral.received
Appointment.cancelled
Encounter.started
Observation.created
Task.completed
Patient.discharged

Include timestamps and system source.

---

# MAIN PORTFOLIO WORKFLOW 1

This workflow MUST work end-to-end in the demo:

Referral arrives
→ AI reads it
→ extracts patient information
→ identifies specialty and urgency
→ detects missing information
→ staff approves
→ patient enters waiting list
→ AI identifies optimal appointment
→ appointment assigned
→ patient receives reminder
→ attendance is tracked.

Make sure the same patient and state persist across every screen.

Do not fake continuity using unrelated data.

---

# MAIN PORTFOLIO WORKFLOW 2

This workflow MUST work end-to-end:

Hospitalised patient
→ expected discharge is available/predicted
→ system checks unresolved pharmacy/test/transport tasks
→ AI highlights likely delay
→ care coordinator reviews
→ blocker is resolved
→ discharge readiness updates
→ patient discharged
→ bed becomes available
→ dashboard updates.

---

# MAIN PORTFOLIO WORKFLOW 3

This workflow MUST work end-to-end:

Nurse reports medication error
→ AI extracts medication/event details
→ nurse confirms
→ safety officer reviews
→ similar incidents automatically grouped
→ recurring pattern is detected
→ Safety Analytics dashboard updates.

---

# AI SIMULATION ARCHITECTURE

Do not scatter random setTimeout calls and hardcoded AI text across components.

Create clean simulated AI services.

Example structure:

src/
  services/
    ai/
      referralAI.ts
      waitingListAI.ts
      dischargeAI.ts
      medicationSafetyAI.ts
      copilotAI.ts
      populationHealthAI.ts

Functions may look conceptually like:

analyzeReferral()
recommendAppointment()
predictDischargeDelay()
analyzeMedicationIncident()
generatePatientSummary()
findSafetyPatterns()

These can use deterministic mock logic based on frontend state.

This is important because later a real API can replace the mocked service implementation without rewriting all UI components.

---

# MOCK NETWORK EXPERIENCE

Where helpful, simulate realistic API-like behavior.

Example:

loading state
300–1000ms delay
success
error scenario where useful

But do NOT make the application unnecessarily slow.

Do not use excessively long fake AI loaders.

---

# ERROR & EDGE STATES

A production-feel demo also needs edge cases.

Implement realistic states such as:

No patients found
No waiting-list matches
Referral incomplete
Appointment conflict
Bed unavailable
Duplicate patient warning
Missing required field
AI analysis failed
Document unsupported
No similar incidents found
Integration disconnected
No available appointments
Patient already discharged
Task already resolved

Handle them properly.

Do not leave buttons that silently do nothing.

---

# ROLE SIMULATION

Optional but highly valuable.

Provide a user-role switcher in Demo Settings or profile menu:

Operations Manager
Clinician
Nurse
Care Coordinator
Safety Officer
Administrator
Patient

Different views/actions can subtly change based on role.

Do not create a full authentication system.

This is only frontend role simulation.

---

# DEMO MODE

Add a subtle indicator:

Demo Environment

or:

Synthetic Data

This protects against the impression that data is real.

Do not make it visually intrusive.

---

# RESPONSIVE DESIGN

The primary experience is desktop/laptop because this is an enterprise healthcare platform.

Optimize first for:

1440px
1280px

Then support tablet.

Patient Portal should also be mobile-friendly.

Do not destroy complex command-centre tables just to force everything into a phone layout.

Use responsive alternatives where appropriate.

---

# ACCESSIBILITY

Healthcare software should feel professionally accessible.

Use:

- good contrast
- keyboard accessibility
- proper labels
- focus states
- accessible dialogs
- semantic inputs
- clear error messages
- avoid conveying status through color alone

---

# PERFORMANCE

Avoid:

- giant monolithic components
- unnecessary re-renders
- duplicated data
- enormous JSON objects inside page components
- excessive animation
- huge dependency additions

Split by modules.

Use reusable primitives.

---

# SUGGESTED PROJECT STRUCTURE

Adapt to the existing project rather than blindly forcing this exact structure.

Conceptually:

src/
  components/
    ui/
    layout/
    common/
    healthcare/
    ai/

  pages/
    overview/
    patients/
    referrals/
    appointments/
    waiting-list/
    patient-flow/
    medication-safety/
    safety-analytics/
    ai-copilot/
    population-health/
    patient-portal/
    integrations/
    settings/

  features/
    patients/
    referrals/
    appointments/
    waitingList/
    patientFlow/
    medicationSafety/

  stores/

  services/
    ai/

  data/
    seed/

  types/

  utils/

---

# MODALS / DRAWERS

Use realistic larger dialogs/drawers.

Examples:

Add Patient
New Referral
Book Appointment
Admit Patient
Assign Bed
Resolve Blocker
Report Medication Incident
Review AI Recommendation

Do not squeeze complex healthcare forms into tiny dialogs.

Use sections, proper spacing and sticky actions where useful.

---

# STATUS BADGES

Create a centralized status system.

Potential statuses:

Active
Admitted
Waiting
Approved
Needs Review
Incomplete
Pending
In Progress
Discharge Ready
Completed
Cancelled
No-show
Critical
High Risk
AI Suggested

Use consistent colors throughout the app.

---

# ICONS

Use Lucide.

Examples:

Patients:
Users

Referrals:
FileInput / Files

Appointments:
CalendarDays

Waiting List:
Clock

Patient Flow:
Activity

Medication:
Pill

Safety:
ShieldAlert

AI:
Sparkles

Integrations:
Plug

Documents:
Files

Do not use random icon libraries together.

---

# REALISM DETAILS

Include small real-product details throughout:

Last updated...
Last synced...
Generated 2 minutes ago
Reviewed by...
Created by...
Audit timestamp
Patient ID
Ward number
Bed number
Facility
Department
Practitioner
Confidence indicator
Source citation
Role
Status
Notification timestamps
Timeline events

These details make the demo believable.

---

# HUMAN-IN-THE-LOOP DESIGN

Critical requirement:

AI should assist.

AI should not make irreversible clinical decisions automatically.

For AI recommendations, support patterns such as:

Approve
Modify
Reject

Show:

AI recommendation

and:

Final Staff Decision

This is especially important for:

Referral urgency
Specialty routing
Clinical documentation
Medication classification
Risk signals

---

# DO NOT DO THESE THINGS

Do NOT:

- Build a static dashboard.
- Build only pretty screens.
- Add non-functional buttons.
- Make every card a different color.
- Use excessive purple gradients.
- Use neon effects.
- Use fake cyber-AI visuals.
- Use Lorem ipsum.
- Use real patient information.
- Build a backend.
- Claim real Epic/Oracle integrations.
- Allow AI to automatically diagnose or prescribe.
- Disconnect workflows from one another.
- Duplicate the same component logic everywhere.
- Add unnecessary complexity.
- Rewrite good existing components without reason.
- Ignore reference documents.

---

# PRODUCT QUALITY EXPECTATION

This is a portfolio piece used to show potential healthcare clients what AspireX can design and build.

It must feel like:

A serious enterprise healthcare product prototype.

Not:

A Dribbble concept.
A landing page.
A generic admin template.
A half-working MVP.

It should be possible to sit with a client and demonstrate:

"Here is a new referral."

Upload it.

"AI has extracted this information."

Review it.

"We approve it."

Patient enters waiting list.

"CareOps recommends this appointment."

Assign it.

"Now here is the appointment."

Send reminder.

Mark patient arrived.

Then immediately move to another workflow:

"This patient is due for discharge."

Show blockers.

Resolve pharmacy.

Resolve transport.

Discharge patient.

See bed availability change.

Then:

"Here is a medication incident."

Report it.

Run simulated AI extraction.

Approve.

Show it grouped with previous incidents.

See Safety Analytics identify a recurring pattern.

That is the experience the application must deliver.

---

# IMPLEMENTATION PRIORITY

Prioritize in this order:

1. Application shell and design system
2. Shared synthetic data/state architecture
3. Command Centre
4. Patient Management
5. Referral Management + AI Referral Assistant
6. Waiting List
7. Appointments
8. Patient Flow + Discharge
9. Medication Safety + ADR
10. Safety Analytics
11. AI Copilot
12. Patient Portal
13. Integrations/FHIR
14. Population Health
15. Final UX polish and edge cases

Do not sacrifice workflow quality in order to add unnecessary pages.

---

# FINAL QA

Before considering the work complete, manually test all important flows.

Specifically verify:

PATIENT FLOW
- Add patient works
- Edit patient works
- Patient appears everywhere expected
- Duplicate warning works

REFERRAL FLOW
- Create/upload referral works
- AI analysis simulation works
- Approval works
- Waiting-list entry is created

WAITING LIST
- Recommended appointment works
- Assigning appointment works
- Appointment appears in calendar

APPOINTMENTS
- Create
- Edit
- Reschedule
- Cancel
- Reminder
- Attendance

PATIENT FLOW
- Admit
- Assign bed
- Update discharge checklist
- Resolve blocker
- Discharge
- Bed becomes available

MEDICATION
- Report incident
- AI extraction simulation
- Review
- Similar incident grouping
- Analytics update

AI COPILOT
- Patient selection works
- Context changes response
- Sources/citations appear

PATIENT PORTAL
- Appointment actions work
- Forms work
- Documents work
- Messaging works

INTEGRATIONS
- Simulated statuses render correctly
- FHIR demo records display correctly

GENERAL
- No dead buttons
- No broken routes
- No console errors
- No obvious layout overflow
- No inconsistent colors
- No mismatched demo data
- No contradictory patient states
- Responsive behavior acceptable
- Demo reset works

---

# FINAL OUTPUT EXPECTATION

Do not only explain what should be built.

Actually implement the frontend.

After implementation, provide me:

1. Summary of what you built.
2. Files created.
3. Files modified.
4. Main routes/pages.
5. State-management approach.
6. Synthetic data structure.
7. AI simulation approach.
8. The three end-to-end demo workflows and how to run each.
9. Any limitations.
10. Any remaining TODOs.

If you find existing code that conflicts with these requirements, inspect it carefully and make the best architectural decision rather than blindly layering new code on top.

Most importantly:

READ ALL PROVIDED REFERENCE DOCUMENTS FIRST.

Use them to understand CareOps AI completely before implementation.

The final result should be a polished, connected, frontend-only healthcare product simulation that looks and behaves convincingly enough to demonstrate to a real prospective healthcare client.