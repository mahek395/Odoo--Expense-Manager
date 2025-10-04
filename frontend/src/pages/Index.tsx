import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowRight, Shield, TrendingUp, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-xl">
              <Receipt className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Simplify Your
            <span className="block mt-2 bg-gradient-to-r from-accent via-accent-hover to-primary bg-clip-text text-transparent">
              Expense Management
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline expense submissions, approvals, and reimbursements with intelligent workflows 
            and real-time tracking. Built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground group px-8"
            >
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="px-8"
            >
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Approvals</h3>
            <p className="text-muted-foreground">
              Configure multi-level approval workflows with conditional rules and automated routing.
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Track expenses, monitor trends, and get insights with comprehensive dashboard analytics.
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-muted-foreground">
              Manage users, assign roles, and define reporting relationships effortlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
