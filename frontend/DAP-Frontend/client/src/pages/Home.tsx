import { Link } from "wouter";
import { ArrowRight, Shield, Database, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto space-y-8 animate-in">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Enterprise-Grade Privacy
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
            Secure your data <br/>
            <span className="text-gradient">without losing insight.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Automated PII detection and smart anonymization for your datasets. 
            Comply with GDPR & HIPAA in minutes, not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/upload">
              <Button size="lg" className="h-14 px-8 rounded-2xl text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-200">
                Start Anonymizing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: Shield,
              title: "Auto-PII Detection",
              desc: "Instantly scans columns to identify sensitive information like emails, SSNs, and names with high confidence."
            },
            {
              icon: Lock,
              title: "Smart Anonymization",
              desc: "Apply k-anonymity, l-diversity, and masking rules automatically based on data sensitivity."
            },
            {
              icon: Database,
              title: "Risk Assessment",
              desc: "Get comprehensive reports on re-identification risks before you export your data."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-32 py-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 DataSafe AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
