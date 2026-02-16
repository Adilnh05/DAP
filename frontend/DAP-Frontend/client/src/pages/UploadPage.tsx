import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { FileUpload } from "@/components/FileUpload";
import { useUploadDataset } from "@/hooks/use-datasets";
import { motion } from "framer-motion";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const uploadMutation = useUploadDataset();

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const result = await uploadMutation.mutateAsync(formData);
      // Navigate to dataset dashboard/preview
      setLocation(`/dataset/${result.dataset.id}`);
    } catch (error) {
      console.error(error);
      // Toast handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold mb-4">Upload Your Dataset</h1>
            <p className="text-muted-foreground text-lg">
              We support CSV files up to 50MB. Your data is encrypted in transit and at rest.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FileUpload 
            onUpload={handleUpload} 
            isUploading={uploadMutation.isPending} 
          />
        </motion.div>

        {/* Security Badge */}
        <div className="mt-16 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-green-500" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Processed locally in secure environment. No third-party data sharing.
        </div>
      </main>
    </div>
  );
}
