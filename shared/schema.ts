import { z } from "zod";

// Frontend-safe schemas and types (no database-specific libraries)

export const insertUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["admin", "analyst", "manager"]),
  avatar: z.string().optional(),
});

export const insertIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["open", "closed", "investigating"]),
  occurredAt: z.string(),
  detectedAt: z.string().optional(),
  acknowledgedAt: z.string().optional(),
  closedAt: z.string().optional(),
});

export const insertAlertSchema = z.object({
  title: z.string().min(1),
  severity: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["new", "investigating", "closed"]),
  assigneeId: z.number().int().optional(),
  disposition: z.enum(["true_positive", "false_positive", "benign_positive", "undecided"]).optional(),
  incidentId: z.number().int().optional(),
  createdAt: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type UpdateAlertRequest = Partial<InsertAlert>;

export interface User {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  role: "admin" | "analyst" | "manager";
  avatar?: string;
}

export interface Incident {
  id: number;
  title: string;
  description?: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "closed" | "investigating";
  occurredAt: string;
  detectedAt?: string;
  acknowledgedAt?: string;
  closedAt?: string;
}

export interface Alert {
  id: number;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "new" | "investigating" | "closed";
  assigneeId?: number;
  disposition?: "true_positive" | "false_positive" | "benign_positive" | "undecided";
  incidentId?: number;
  createdAt?: string;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  closedCases: number;
  mttd: number; // Average seconds
  mttr: number; // Average seconds
}

export interface ClassificationMetrics {
  truePositives: number;
  falsePositives: number;
  benignPositives: number;
}
