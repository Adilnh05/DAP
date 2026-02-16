import { Link, useLocation } from "wouter";
import { ShieldCheck, Database, Activity, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { label: "Overview", path: "/", icon: ShieldCheck },
    { label: "Upload", path: "/upload", icon: Database },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mr-8 flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="hidden font-display text-xl font-bold sm:inline-block tracking-tight text-foreground">
                DataSafe<span className="text-primary">.ai</span>
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                    location === item.path 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
          
          <div className="ml-4 flex items-center gap-2 pl-4 border-l border-border/50">
             {/* Placeholder for User Profile or Settings */}
             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                JD
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
