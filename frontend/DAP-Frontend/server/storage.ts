// server/storage.ts
// In-memory storage replacement (no PostgreSQL required)

export interface Dataset {
  id: number;
  fileName: string;
  fileSize: number;
  originalPath: string;
  rowCount: number;
  columnNames: string[];
  createdAt: Date;
}

export interface DetectionResults {
  id: number;
  datasetId: number;
  results: any[];
  createdAt: Date;
}

export interface AnonymizationJob {
  id: number;
  datasetId: number;
  config: any;
  status: string;
  outputPath?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskReport {
  id: number;
  datasetId: number;
  jobId: number;
  overallScore: number;
  metrics: any;
  attackerRisks: any;
  createdAt: Date;
}


// ===============================
// In-Memory Data Stores
// ===============================

let datasets: Dataset[] = [];
let detections: DetectionResults[] = [];
let jobs: AnonymizationJob[] = [];
let risks: RiskReport[] = [];

let idCounter = 1;


// ===============================
// Storage Implementation
// ===============================

export const storage = {

  // DATASETS
  async createDataset(data: Omit<Dataset, "id" | "createdAt">): Promise<Dataset> {
    const dataset: Dataset = {
      id: idCounter++,
      createdAt: new Date(),
      ...data,
    };

    datasets.push(dataset);
    return dataset;
  },

  async getDataset(id: number): Promise<Dataset | undefined> {
    return datasets.find((d) => d.id === id);
  },


  // DETECTION
  async createDetectionResult(datasetId: number, results: any[]): Promise<DetectionResults> {
    const record: DetectionResults = {
      id: idCounter++,
      datasetId,
      results,
      createdAt: new Date(),
    };

    detections.push(record);
    return record;
  },

  async getDetectionResult(datasetId: number): Promise<DetectionResults | undefined> {
    return detections
      .filter((d) => d.datasetId === datasetId)
      .sort((a, b) => b.id - a.id)[0];
  },


  // JOBS
  async createAnonymizationJob(datasetId: number, config: any): Promise<AnonymizationJob> {
    const job: AnonymizationJob = {
      id: idCounter++,
      datasetId,
      config,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.push(job);
    return job;
  },

  async getAnonymizationJob(id: number): Promise<AnonymizationJob | undefined> {
    return jobs.find((j) => j.id === id);
  },

  async updateAnonymizationJob(
    id: number,
    updates: Partial<AnonymizationJob>
  ): Promise<AnonymizationJob> {
    const job = jobs.find((j) => j.id === id);
    if (!job) throw new Error("Job not found");

    Object.assign(job, updates, { updatedAt: new Date() });
    return job;
  },


  // RISK
  async createRiskReport(
    datasetId: number,
    jobId: number,
    overallScore: number,
    metrics: any,
    attackerRisks: any
  ): Promise<RiskReport> {
    const report: RiskReport = {
      id: idCounter++,
      datasetId,
      jobId,
      overallScore,
      metrics,
      attackerRisks,
      createdAt: new Date(),
    };

    risks.push(report);
    return report;
  },

  async getRiskReport(datasetId: number): Promise<RiskReport | undefined> {
    return risks.find((r) => r.datasetId === datasetId);
  },
};
