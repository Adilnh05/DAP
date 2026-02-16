import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowRight, Play } from "lucide-react";
import type { DetectionResultItem, AnonymizeRequest, AnonymizationAction, GeneralizationMode } from "@shared/schema";

interface AnonymizationConfigProps {
  detectionResults: DetectionResultItem[];
  onSubmit: (config: AnonymizeRequest) => void;
  isSubmitting: boolean;
}

export function AnonymizationConfig({ detectionResults, onSubmit, isSubmitting }: AnonymizationConfigProps) {
  const [rules, setRules] = useState<AnonymizeRequest["rules"]>({});

  // Initialize rules based on detection results
  useState(() => {
    const initialRules: AnonymizeRequest["rules"] = {};
    detectionResults.forEach(res => {
      if (res.label === "PII") {
        initialRules[res.column] = { action: "MASK" };
      } else if (res.label === "QUASI") {
        initialRules[res.column] = { action: "GENERALIZE", mode: "AGE_BUCKET" };
      } else {
        initialRules[res.column] = { action: "NONE" };
      }
    });
    setRules(initialRules);
  });

  const handleActionChange = (column: string, action: AnonymizationAction) => {
    setRules(prev => ({
      ...prev,
      [column]: { ...prev[column], action }
    }));
  };

  const handleModeChange = (column: string, mode: GeneralizationMode) => {
    setRules(prev => ({
      ...prev,
      [column]: { ...prev[column], mode }
    }));
  };

  const handleSubmit = () => {
    onSubmit({ rules });
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Anonymization Rules
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {detectionResults.length} Columns Detected
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {detectionResults.map((item) => (
            <div 
              key={item.column} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="mb-3 sm:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{item.column}</span>
                  {item.label === "PII" && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">PII</Badge>}
                  {item.label === "QUASI" && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-200 text-amber-700 bg-amber-50">QUASI</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Type: {item.type}</p>
              </div>

              <div className="flex items-center gap-2">
                <Select 
                  value={rules[item.column]?.action || "NONE"} 
                  onValueChange={(val) => handleActionChange(item.column, val as AnonymizationAction)}
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Keep As Is</SelectItem>
                    <SelectItem value="MASK">Mask (***)</SelectItem>
                    <SelectItem value="HASH">Hash (SHA256)</SelectItem>
                    <SelectItem value="GENERALIZE">Generalize</SelectItem>
                    <SelectItem value="DROP">Drop Column</SelectItem>
                  </SelectContent>
                </Select>

                {rules[item.column]?.action === "GENERALIZE" && (
                  <Select 
                    value={rules[item.column]?.mode || "AGE_BUCKET"} 
                    onValueChange={(val) => handleModeChange(item.column, val as GeneralizationMode)}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGE_BUCKET">Age Bucket</SelectItem>
                      <SelectItem value="YEAR">Year Only</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-8 py-6 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            {isSubmitting ? (
              "Starting Job..."
            ) : (
              <>
                Run Anonymization <Play className="ml-2 h-4 w-4 fill-current" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
