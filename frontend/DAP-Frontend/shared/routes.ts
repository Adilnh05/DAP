
import { z } from 'zod';
import { 
  insertDatasetSchema, 
  datasets, 
  detectionResults, 
  anonymizationJobs, 
  riskReports,
  anonymizeRequestSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  datasets: {
    upload: {
      method: 'POST' as const,
      path: '/api/datasets/upload' as const,
      // Input is FormData, handled separately in express
      responses: {
        201: z.object({
          dataset: z.custom<typeof datasets.$inferSelect>(),
          schema: z.array(z.string()),
          preview: z.array(z.record(z.any()))
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/datasets/:id' as const,
      responses: {
        200: z.object({
          dataset: z.custom<typeof datasets.$inferSelect>(),
          schema: z.array(z.string()),
          preview: z.array(z.record(z.any()))
        }),
        404: errorSchemas.notFound,
      },
    },
    detect: {
      method: 'POST' as const,
      path: '/api/datasets/:id/detect' as const,
      responses: {
        200: z.object({
          results: z.array(z.object({
            column: z.string(),
            type: z.string(),
            label: z.enum(["PII", "QUASI", "SAFE"]),
            confidence: z.number()
          }))
        }),
        404: errorSchemas.notFound,
      },
    },
    getDetection: {
        method: 'GET' as const,
        path: '/api/datasets/:id/detect' as const,
        responses: {
            200: z.object({
                results: z.array(z.object({
                    column: z.string(),
                    type: z.string(),
                    label: z.enum(["PII", "QUASI", "SAFE"]),
                    confidence: z.number()
                }))
            }),
            404: errorSchemas.notFound,
        }
    },
    anonymize: {
      method: 'POST' as const,
      path: '/api/datasets/:id/anonymize' as const,
      input: anonymizeRequestSchema,
      responses: {
        201: z.custom<typeof anonymizationJobs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    risk: {
      method: 'POST' as const,
      path: '/api/datasets/:id/risk' as const,
      input: z.object({
        jobId: z.number()
      }),
      responses: {
        201: z.custom<typeof riskReports.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    getRisk: {
        method: 'GET' as const,
        path: '/api/datasets/:id/risk' as const,
        responses: {
            200: z.custom<typeof riskReports.$inferSelect>(),
            404: errorSchemas.notFound,
        }
    }
  },
  jobs: {
    get: {
      method: 'GET' as const,
      path: '/api/jobs/:id' as const,
      responses: {
        200: z.custom<typeof anonymizationJobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    download: {
      method: 'GET' as const,
      path: '/api/jobs/:id/download' as const,
      responses: {
        200: z.any(), // File stream
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
