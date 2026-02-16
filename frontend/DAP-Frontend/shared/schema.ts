
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  originalPath: text("original_path").notNull(), // Path to the uploaded CSV
  rowCount: integer("row_count"),
  columnNames: text("column_names").array(), // Store column names for quick access
  createdAt: timestamp("created_at").defaultNow(),
});

export const detectionResults = pgTable("detection_results", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id).notNull(),
  results: jsonb("results").notNull(), // Array of { column: string, type: string, label: string, confidence: number }
  createdAt: timestamp("created_at").defaultNow(),
});

export const anonymizationJobs = pgTable("anonymization_jobs", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  config: jsonb("config").notNull(), // The rules applied: { [column]: { action: string, mode?: string } }
  outputPath: text("output_path"), // Path to the anonymized CSV
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const riskReports = pgTable("risk_reports", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id).notNull(),
  jobId: integer("job_id").references(() => anonymizationJobs.id).notNull(),
  overallScore: integer("overall_score").notNull(), // 0-100
  metrics: jsonb("metrics").notNull(), // { uniqueness: number, kAnonymity: number, ... }
  attackerRisks: jsonb("attacker_risks").notNull(), // Array of warnings/risks
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertDatasetSchema = createInsertSchema(datasets).omit({ id: true, createdAt: true, rowCount: true, columnNames: true });
export const insertDetectionResultSchema = createInsertSchema(detectionResults).omit({ id: true, createdAt: true });
export const insertAnonymizationJobSchema = createInsertSchema(anonymizationJobs).omit({ id: true, createdAt: true, updatedAt: true, outputPath: true, errorMessage: true });
export const insertRiskReportSchema = createInsertSchema(riskReports).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Dataset types
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

// Detection types
export interface DetectionResultItem {
  column: string;
  type: string;
  label: "PII" | "QUASI" | "SAFE";
  confidence: number;
}
export type DetectionResults = typeof detectionResults.$inferSelect;

// Anonymization types
export type AnonymizationAction = "NONE" | "MASK" | "HASH" | "GENERALIZE" | "DROP";
export type GeneralizationMode = "YEAR" | "AGE_BUCKET";

export interface AnonymizationRule {
  action: AnonymizationAction;
  mode?: GeneralizationMode;
}

export interface AnonymizationConfig {
  [columnName: string]: AnonymizationRule;
}

export type AnonymizationJob = typeof anonymizationJobs.$inferSelect;
export type JobStatus = "pending" | "running" | "completed" | "failed";

// Risk types
export type RiskReport = typeof riskReports.$inferSelect;

// API Response Types
export interface DatasetPreviewResponse {
  dataset: Dataset;
  schema: string[];
  preview: Record<string, any>[]; // Array of rows
}

export interface DetectionResponse {
  results: DetectionResultItem[];
}

export interface AnonymizationJobResponse extends AnonymizationJob {
  // Add any computed fields if necessary
}

export interface RiskReportResponse extends RiskReport {
  // Add any computed fields if necessary
}

// Request Types
export const anonymizeRequestSchema = z.object({
  rules: z.record(z.string(), z.object({
    action: z.enum(["NONE", "MASK", "HASH", "GENERALIZE", "DROP"]),
    mode: z.enum(["YEAR", "AGE_BUCKET"]).optional()
  }))
});

export type AnonymizeRequest = z.infer<typeof anonymizeRequestSchema>;
