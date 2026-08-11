export type PatientStatus = "Active" | "Admitted" | "Waiting" | "Discharged";
export interface Timeline {
  id: string;
  at: string;
  type: string;
  summary: string;
  source: string;
}
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  phone: string;
  email: string;
  language: string;
  ward: string;
  status: PatientStatus;
  address?: string;
  externalId?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  consent: {
    sms: boolean;
    email: boolean;
    portal: boolean;
    dataSharing?: boolean;
  };
  timeline: Timeline[];
}
export interface Referral {
  id: string;
  patientId: string;
  source: string;
  service: string;
  suggested: string;
  urgency: "Routine" | "Urgent" | "Critical";
  status: "Needs Review" | "Approved" | "Rejected";
  received: string;
  missing: string[];
  confidence: number;
}
export interface WaitEntry {
  id: string;
  patientId: string;
  referralId?: string;
  specialty: string;
  priority: string;
  since: string;
  missing?: string[];
  targetDays?: number;
  noShows?: number;
  risk: "Low" | "Medium" | "High";
  status: "Waiting" | "Scheduled";
}
export interface Appointment {
  id: string;
  patientId: string;
  practitioner: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  duration?: number;
  notes?: string;
  cancelReason?: string;
  status:
    | "Scheduled"
    | "Confirmed"
    | "Arrived"
    | "In Progress"
    | "Completed"
    | "No-show"
    | "Cancelled";
  reminder?: string;
  reminderChannels?: string[];
}
export interface Bed {
  id: string;
  ward: string;
  status: "Available" | "Occupied" | "Cleaning" | "Reserved" | "Unavailable";
  patientId?: string;
}
export interface Admission {
  id: string;
  patientId: string;
  ward: string;
  bedId: string;
  consultant: string;
  reason: string;
  expected: string;
  status: "Active" | "Discharged";
  blockers: {
    id: string;
    name: string;
    status: "Complete" | "Pending" | "In Progress" | "Blocked" | "Not Required";
  }[];
}
export interface Incident {
  id: string;
  patientId: string;
  medication: string;
  prescribed: string;
  administered: string;
  type: string;
  severity: "Low" | "Moderate" | "High";
  ward: string;
  narrative: string;
  status: "Awaiting Safety Review" | "Approved" | "Closed";
  at: string;
}
export interface CareTask {
  id: string;
  patientId: string;
  title: string;
  owner: string;
  due: string;
  status: "Pending" | "In Progress" | "Completed";
  category: string;
}
export interface PatientDocument {
  id: string;
  patientId: string;
  name: string;
  type: string;
  uploadedAt: string;
  source: string;
  size?: number;
  mimeType?: string;
}
export interface PatientMessage {
  id: string;
  patientId: string;
  sender: "Patient" | "Care Team";
  body: string;
  at: string;
}
export interface PatientForm {
  id: string;
  patientId: string;
  name: string;
  status: "Not Started" | "Completed";
  completedAt?: string;
}
export interface Note {
  id: string;
  patientId: string;
  body: string;
  author: string;
  at: string;
}
export interface CorrectiveAction {
  id: string;
  incidentId: string;
  rootCause: string;
  factors: string;
  action: string;
  owner: string;
  due: string;
  status: "Open" | "In Progress" | "Completed";
}
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
}
export interface IntegrationConnection {
  id: string;
  name: string;
  kind: string;
  status: "Connected" | "Syncing" | "Attention Required" | "Disconnected";
  lastSync: string;
}
export interface IntegrationEvent {
  id: string;
  type: string;
  source: string;
  at: string;
  payload: string;
}
