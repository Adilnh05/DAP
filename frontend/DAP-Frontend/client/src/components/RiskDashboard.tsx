import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { ShieldAlert, Users, Lock, EyeOff } from "lucide-react";
import type { RiskReportResponse } from "@shared/schema";

interface RiskDashboardProps {
  report: RiskReportResponse;
}

export function RiskDashboard({ report }: RiskDashboardProps) {
  const metrics = report.metrics as any;
  const overallScore = report.overallScore;

  // Data for charts
  const reIDRiskData = [
    { name: 'Unique', value: metrics.uniqueness * 100 },
    { name: 'Common', value: 100 - (metrics.uniqueness * 100) },
  ];
  
  const COLORS = ['#ef4444', '#22c55e'];

  const kAnonymityData = [
    { name: 'k=1', value: 10 },
    { name: 'k=2', value: 15 },
    { name: 'k=3', value: 25 },
    { name: 'k>5', value: 50 },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-secondary/20 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-muted-foreground">Privacy Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 flex items-center justify-center">
                 {/* Circular Progress Implementation with SVG */}
                 <svg className="h-full w-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                    <circle 
                      cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" 
                      className={overallScore > 80 ? "text-green-500" : overallScore > 50 ? "text-amber-500" : "text-red-500"}
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 - (351.86 * overallScore) / 100}
                      strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <span className="text-4xl font-bold tracking-tighter">{overallScore}</span>
                   <span className="text-xs text-muted-foreground uppercase font-medium">/ 100</span>
                 </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {overallScore > 80 ? "Low Risk" : overallScore > 50 ? "Moderate Risk" : "High Risk"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {overallScore > 80 
                    ? "Your dataset has strong privacy protections. Re-identification risk is minimal."
                    : "Some quasi-identifiers pose a risk. Consider increasing generalization levels."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-rows-2 gap-4">
          <Card className="flex flex-col justify-center border-l-4 border-l-primary">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">k-Anonymity</p>
                <div className="text-3xl font-bold">{metrics.kAnonymity}</div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-center border-l-4 border-l-blue-500">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">l-Diversity</p>
                <div className="text-3xl font-bold">{metrics.lDiversity || "N/A"}</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <EyeOff className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Population Uniqueness</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reIDRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reIDRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Unique (Risky)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Common (Safe)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kAnonymityData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attacker Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
             <ShieldAlert className="h-5 w-5 text-destructive" />
             Potential Vulnerabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {(report.attackerRisks as any[]).map((risk, i) => (
               <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                 <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <div>
                   <h4 className="text-sm font-semibold">{risk.type || "Linkage Attack"}</h4>
                   <p className="text-xs text-muted-foreground mt-1">{risk.description || "Combination of Zip Code and DOB could re-identify 12% of records."}</p>
                 </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
