import type { Express, Request, Response } from "express";
import type { Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { parse } from "csv-parse/sync";


// Extend Express Request to include multer file

interface MulterRequest extends Request {
  file?: Express.Multer.File;   
}


// Setup multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});


// Ensure directories exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("processed")) fs.mkdirSync("processed");


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==============================
  // POST /datasets/upload
  // ==============================
  app.post(
    api.datasets.upload.path,
    upload.single("file"),
    async (req: MulterRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const originalPath = req.file.path;
        const fileContent = fs.readFileSync(originalPath, "utf-8");

        // Parse preview
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          to: 50
        });

        if (!records.length) {
          return res.status(400).json({ message: "Empty CSV file" });
        }

        const columnNames = Object.keys(
          records[0] as Record<string, any>
        );

        // Estimate row count
        const allLines = fileContent
          .split("\n")
          .filter((l) => l.trim().length > 0);

        const rowCount = Math.max(0, allLines.length - 1);

        const dataset = await storage.createDataset({
          fileName: req.file.originalname,
          fileSize: req.file.size,
          originalPath,
          rowCount,
          columnNames
        });

        res.status(201).json({
          dataset,
          schema: columnNames,
          preview: records
        });

      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Failed to process upload" });
      }
    }
  );


  // ==============================
  // GET /datasets/:id
  // ==============================
  app.get(api.datasets.get.path, async (req: Request, res: Response) => {
    const dataset = await storage.getDataset(Number(req.params.id));

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    try {
      const fileContent = fs.readFileSync(dataset.originalPath, "utf-8");

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        to: 50
      });

      res.json({
        dataset,
        schema: dataset.columnNames || [],
        preview: records
      });

    } catch {
      res.status(500).json({ message: "Failed to read dataset file" });
    }
  });


  // ==============================
  // POST /datasets/:id/detect
  // ==============================
  app.post(api.datasets.detect.path, async (req: Request, res: Response) => {
    const datasetId = Number(req.params.id);
    const dataset = await storage.getDataset(datasetId);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    const results = (dataset.columnNames || []).map((col) => {
      const lower = col.toLowerCase();

      let label = "SAFE";
      let confidence = 0.99;

      if (
        lower.includes("email") ||
        lower.includes("phone") ||
        lower.includes("ssn")
      ) {
        label = "PII";
      } else if (
        lower.includes("zip") ||
        lower.includes("dob") ||
        lower.includes("gender") ||
        lower.includes("age")
      ) {
        label = "QUASI";
        confidence = 0.85;
      }

      return {
        column: col,
        type: "string",
        label,
        confidence
      };
    });

    const saved = await storage.createDetectionResult(datasetId, results);
    res.json(saved);
  });


  // ==============================
  // GET detection
  // ==============================
  app.get(api.datasets.getDetection.path, async (req: Request, res: Response) => {
    const results = await storage.getDetectionResult(Number(req.params.id));

    if (!results) {
      return res.status(404).json({ message: "Detection results not found" });
    }

    res.json(results);
  });


  // ==============================
  // POST anonymize
  // ==============================
  app.post(api.datasets.anonymize.path, async (req: Request, res: Response) => {
    try {
      const datasetId = Number(req.params.id);
      const dataset = await storage.getDataset(datasetId);

      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }

      const input = api.datasets.anonymize.input.parse(req.body);

      const job = await storage.createAnonymizationJob(
        datasetId,
        input.rules
      );

      // Async simulation
      (async () => {
        try {
          await storage.updateAnonymizationJob(job.id, { status: "running" });

          await new Promise((r) => setTimeout(r, 3000));

          const outputPath = path.join(
            "processed",
            `anonymized_${datasetId}_${job.id}.csv`
          );

          fs.copyFileSync(dataset.originalPath, outputPath);

          await storage.updateAnonymizationJob(job.id, {
            status: "completed",
            outputPath
          });

        } catch (e: any) {
          await storage.updateAnonymizationJob(job.id, {
            status: "failed",
            errorMessage: e.message
          });
        }
      })();

      res.status(201).json(job);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  });


  // ==============================
  // Jobs
  // ==============================
  app.get(api.jobs.get.path, async (req: Request, res: Response) => {
    const job = await storage.getAnonymizationJob(Number(req.params.id));

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  });


  app.get(api.jobs.download.path, async (req: Request, res: Response) => {
    const job = await storage.getAnonymizationJob(Number(req.params.id));

    if (!job || !job.outputPath) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(job.outputPath);
  });


  // ==============================
  // Risk
  // ==============================
  app.post(api.datasets.risk.path, async (req: Request, res: Response) => {
    const datasetId = Number(req.params.id);
    const { jobId } = req.body;

    const report = await storage.createRiskReport(
      datasetId,
      jobId,
      85,
      { uniqueness: 0.12, kAnonymity: 5 },
      ["Possible re-identification via Zip + DOB"]
    );

    res.status(201).json(report);
  });


  app.get(api.datasets.getRisk.path, async (req: Request, res: Response) => {
    const report = await storage.getRiskReport(Number(req.params.id));

    if (!report) {
      return res.status(404).json({ message: "Risk report not found" });
    }

    res.json(report);
  });


  return httpServer;
}
