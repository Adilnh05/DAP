import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileType, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });

  const handleUpload = async () => {
    if (!file) return;
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await onUpload(file);
      setProgress(100);
    } catch (e) {
      setProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="dropzone"
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out bg-card",
                isDragActive 
                  ? "border-primary bg-primary/5 scale-[1.01]" 
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
              )}
            >
              <input {...getInputProps()} />
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">
                {isDragActive ? "Drop your CSV here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: CSV (max 50MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key="file-preview"
            className="bg-card rounded-2xl border border-border shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileType className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground truncate max-w-[200px]">
                    {file.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button 
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={isUploading} 
              className="w-full h-11 text-base font-medium rounded-xl shadow-lg shadow-primary/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Processing"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
