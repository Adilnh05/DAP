import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { DetectionTable } from "@/components/DetectionTable";
import { AnonymizationConfig } from "@/components/AnonymizationConfig";
import { RiskDashboard } from "@/components/RiskDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { 
  useDataset, 
  useDetectPII, 
  useDetectionResults, 
  useAnonymizeDataset,
  useJob,
  useRiskReport,
  useGenerateRiskReport 
} from "@/hooks/use-datasets";
import type { AnonymizeRequest } from "@shared/schema";

export default function DatasetDashboard() {
  const [match, params] = useRoute("/dataset/:id");
  const id = parseInt(params?.id || "0");
  const [activeTab, setActiveTab] = useState("overview");
  const [jobId, setJobId] = useState<number | null>(null);

  // Queries
  const { data: dataset, isLoading: isDatasetLoading } = useDataset(id);
  const { data: detectionResults, isLoading: isDetectionLoading } = useDetectionResults(id);
  const { data: job, isLoading: isJobLoading } = useJob(jobId || 0);
  const { data: riskReport } = useRiskReport(id);

  // Mutations
  const detectMutation = useDetectPII(id);
  const anonymizeMutation = useAnonymizeDataset();
  const generateRiskMutation = useGenerateRiskReport();

  // Effects to handle flow
  useEffect(() => {
    // If we have dataset but no detection results, run detection automatically
    if (dataset && !detectionResults && !isDetectionLoading && !detectMutation.isPending && !detectMutation.isSuccess) {
      detectMutation.mutate();
    }
  }, [dataset, detectionResults]);

  useEffect(() => {
    if (job?.status === "completed" && !riskReport) {
       generateRiskMutation.mutate({ datasetId: id, jobId: job.id });
    }
  }, [job, riskReport]);


  const handleStartAnonymization = async (config: AnonymizeRequest) => {
    try {
      const result = await anonymizeMutation.mutateAsync({ id, data: config });
      setJobId(result.id);
      setActiveTab("processing");
    } catch (e) {
      console.error(e);
    }
  };

  if (isDatasetLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!dataset) return <div>Dataset not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">{dataset.dataset.fileName}</h1>
               <Badge variant="outline" className="font-mono">{dataset.dataset.rowCount?.toLocaleString()} Rows</Badge>
            </div>
            <p className="text-muted-foreground">Original size: {(dataset.dataset.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded on {new Date(dataset.dataset.createdAt!).toLocaleDateString()}</p>
          </div>
          
          {job?.status === "completed" && (
            <Button className="shadow-lg shadow-primary/20">
               <Download className="mr-2 h-4 w-4" /> Download Anonymized CSV
            </Button>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-secondary/50 p-1 h-12 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Overview</TabsTrigger>
            <TabsTrigger value="configuration" className="rounded-lg h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Anonymization Config</TabsTrigger>
            <TabsTrigger value="processing" className="rounded-lg h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled={!jobId}>Processing Status</TabsTrigger>
            <TabsTrigger value="risk" className="rounded-lg h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm" disabled={!riskReport}>Risk Report</TabsTrigger>
          </TabsList>

          {/* Tab: Overview (Detection Results) */}
          <TabsContent value="overview" className="space-y-6 animate-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold">PII Detection Results</h2>
                   {detectMutation.isPending && (
                     <div className="flex items-center text-sm text-primary">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing columns...
                     </div>
                   )}
                 </div>
                 
                 {detectionResults ? (
                   <DetectionTable results={detectionResults.results} />
                 ) : (
                   <div className="h-64 flex items-center justify-center border rounded-xl bg-card">
                     <p className="text-muted-foreground">Waiting for analysis...</p>
                   </div>
                 )}
               </div>
               
               <div className="lg:col-span-1">
                 <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
                   <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Next Steps</h3>
                   <p className="text-sm text-blue-800 dark:text-blue-200 mb-6">
                     Review the detected PII types. Once you are satisfied with the classification, proceed to the Configuration tab to set anonymization rules.
                   </p>
                   <Button 
                     className="w-full bg-blue-600 hover:bg-blue-700"
                     onClick={() => setActiveTab("configuration")}
                   >
                     Configure Rules
                   </Button>
                 </div>
               </div>
             </div>
          </TabsContent>

          {/* Tab: Configuration */}
          <TabsContent value="configuration" className="animate-in">
             {detectionResults ? (
               <AnonymizationConfig 
                 detectionResults={detectionResults.results} 
                 onSubmit={handleStartAnonymization}
                 isSubmitting={anonymizeMutation.isPending}
               />
             ) : (
               <div className="text-center py-20">
                 <p className="text-muted-foreground">Please wait for detection to complete first.</p>
               </div>
             )}
          </TabsContent>

          {/* Tab: Processing Status */}
          <TabsContent value="processing" className="animate-in">
             <div className="max-w-2xl mx-auto py-12">
               {job ? (
                 <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-sm">
                   <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      {job.status === "running" || job.status === "pending" ? (
                        <>
                           <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                           <Loader2 className="h-8 w-8 text-primary" />
                        </>
                      ) : job.status === "completed" ? (
                        <div className="w-full h-full bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                   </div>
                   
                   <div>
                     <h2 className="text-2xl font-bold capitalize mb-2">{job.status === "running" ? "Anonymizing Data..." : `Job ${job.status}`}</h2>
                     <p className="text-muted-foreground">
                        {job.status === "running" 
                          ? "Applying transformation rules and calculating privacy metrics." 
                          : job.status === "completed" 
                          ? "Your dataset has been successfully anonymized."
                          : "Something went wrong during processing."}
                     </p>
                   </div>

                   {job.status === "completed" && (
                     <div className="flex justify-center gap-4 pt-4">
                       <Button onClick={() => setActiveTab("risk")} variant="outline">View Risk Report</Button>
                       <Button>Download Result</Button>
                     </div>
                   )}
                 </div>
               ) : (
                 <p className="text-center">No job active.</p>
               )}
             </div>
          </TabsContent>

          {/* Tab: Risk Report */}
          <TabsContent value="risk" className="animate-in">
            {riskReport ? (
              <RiskDashboard report={riskReport} />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
