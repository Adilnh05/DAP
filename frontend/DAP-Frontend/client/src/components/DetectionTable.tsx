import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DetectionResultItem } from "@shared/schema";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface DetectionTableProps {
  results: DetectionResultItem[];
}

export function DetectionTable({ results }: DetectionTableProps) {
  const getLabelColor = (label: string) => {
    switch (label) {
      case "PII": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "QUASI": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "SAFE": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getIcon = (label: string) => {
    switch (label) {
      case "PII": return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      case "QUASI": return <HelpCircle className="w-3.5 h-3.5 mr-1" />;
      case "SAFE": return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[200px] font-semibold">Column Name</TableHead>
            <TableHead className="font-semibold">Detected Type</TableHead>
            <TableHead className="font-semibold">Sensitivity Label</TableHead>
            <TableHead className="text-right font-semibold">Confidence Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((item, idx) => (
            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono text-sm font-medium text-foreground">
                {item.column}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.type || "Unknown"}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={cn("px-2.5 py-0.5 rounded-full font-semibold border transition-all", getLabelColor(item.label))}
                >
                  <div className="flex items-center">
                    {getIcon(item.label)}
                    {item.label}
                  </div>
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.confidence > 0.8 ? "bg-primary" : item.confidence > 0.5 ? "bg-amber-500" : "bg-gray-300"
                      )}
                      style={{ width: `${item.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
