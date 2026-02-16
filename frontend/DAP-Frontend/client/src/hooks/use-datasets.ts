import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type DatasetPreviewResponse, 
  type DetectionResponse, 
  type AnonymizationJobResponse,
  type RiskReportResponse,
  type AnonymizeRequest
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Upload Dataset
export function useUploadDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.datasets.upload.path, {
        method: api.datasets.upload.method,
        body: formData, // FormData handles Content-Type automatically
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload dataset");
      }
      
      return api.datasets.upload.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.datasets.get.path, data.dataset.id] });
      toast({
        title: "Upload Successful",
        description: `Dataset "${data.dataset.fileName}" ready for processing.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Get Dataset Preview
export function useDataset(id: number) {
  return useQuery({
    queryKey: [api.datasets.get.path, id],
    queryFn: async () => {
      if (!id || isNaN(id)) return null;
      const url = buildUrl(api.datasets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch dataset");
      return api.datasets.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Run Detection
export function useDetectPII(datasetId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.datasets.detect.path, { id: datasetId });
      const res = await fetch(url, {
        method: api.datasets.detect.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Detection failed");
      return api.datasets.detect.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.datasets.getDetection.path, datasetId] });
      toast({
        title: "Detection Complete",
        description: "PII analysis finished successfully.",
      });
    },
  });
}

// Get Detection Results
export function useDetectionResults(datasetId: number) {
  return useQuery({
    queryKey: [api.datasets.getDetection.path, datasetId],
    queryFn: async () => {
      const url = buildUrl(api.datasets.getDetection.path, { id: datasetId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch detection results");
      return api.datasets.getDetection.responses[200].parse(await res.json());
    },
    enabled: !!datasetId,
  });
}

// Create Anonymization Job
export function useAnonymizeDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AnonymizeRequest }) => {
      const url = buildUrl(api.datasets.anonymize.path, { id });
      const validated = api.datasets.anonymize.input.parse(data);
      
      const res = await fetch(url, {
        method: api.datasets.anonymize.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to start anonymization");
      return api.datasets.anonymize.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Job Started",
        description: "Anonymization job is running in background.",
      });
      // Invalidate job queries if necessary
    },
  });
}

// Get Job Status
export function useJob(id: number) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch job");
      return api.jobs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'pending' || status === 'running') ? 2000 : false;
    }
  });
}

// Get Risk Report
export function useRiskReport(datasetId: number) {
  return useQuery({
    queryKey: [api.datasets.getRisk.path, datasetId],
    queryFn: async () => {
      const url = buildUrl(api.datasets.getRisk.path, { id: datasetId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch risk report");
      return api.datasets.getRisk.responses[200].parse(await res.json());
    },
    enabled: !!datasetId,
  });
}

// Generate Risk Report
export function useGenerateRiskReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ datasetId, jobId }: { datasetId: number, jobId: number }) => {
      const url = buildUrl(api.datasets.risk.path, { id: datasetId });
      const res = await fetch(url, {
        method: api.datasets.risk.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate risk report");
      return api.datasets.risk.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.datasets.getRisk.path, variables.datasetId] });
    }
  });
}
