import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings2,
  Plus,
  Percent,
  UserCheck,
  GitBranch,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";

const ApprovalRules = () => {
  const rules = [
    {
      id: 1,
      name: "Standard Travel Approval",
      type: "Sequential",
      description: "Manager → Finance → Director",
      threshold: "$500",
      enabled: true,
      steps: 3,
    },
    {
      id: 2,
      name: "Quick Approval - Office Supplies",
      type: "Percentage",
      description: "60% of approvers must approve",
      threshold: "$200",
      enabled: true,
      steps: 2,
    },
    {
      id: 3,
      name: "Executive Approval",
      type: "Specific Approver",
      description: "CFO approval required",
      threshold: "$5,000",
      enabled: true,
      steps: 1,
    },
    {
      id: 4,
      name: "Team Expenses",
      type: "Hybrid",
      description: "60% OR Manager approval",
      threshold: "$1,000",
      enabled: false,
      steps: 2,
    },
  ];

  const getRuleTypeBadge = (type: string) => {
    const variants = {
      Sequential: "bg-primary/10 text-primary",
      Percentage: "bg-accent/10 text-accent",
      "Specific Approver": "bg-success/10 text-success",
      Hybrid: "bg-warning/10 text-warning",
    };
    return variants[type as keyof typeof variants] || variants.Sequential;
  };

  const getRuleIcon = (type: string) => {
    const icons = {
      Sequential: GitBranch,
      Percentage: Percent,
      "Specific Approver": UserCheck,
      Hybrid: Settings2,
    };
    const Icon = icons[type as keyof typeof icons] || GitBranch;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approval Rules</h1>
          <p className="text-muted-foreground mt-1">Configure approval workflows and conditions</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Rule Types Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Sequential",
            desc: "Multi-level approvals in order",
            icon: GitBranch,
            color: "text-primary",
          },
          {
            title: "Percentage",
            desc: "X% of approvers must approve",
            icon: Percent,
            color: "text-accent",
          },
          {
            title: "Specific",
            desc: "Designated approver required",
            icon: UserCheck,
            color: "text-success",
          },
          {
            title: "Hybrid",
            desc: "Combined rule conditions",
            icon: Settings2,
            color: "text-warning",
          },
        ].map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.title} className="border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`${type.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Rules */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>Manage and configure your approval workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getRuleIcon(rule.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge className={getRuleTypeBadge(rule.type)}>
                        {rule.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="font-medium">{rule.threshold}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">Steps:</span>
                        <span className="font-medium">{rule.steps}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id={`rule-${rule.id}`} checked={rule.enabled} />
                    <Label htmlFor={`rule-${rule.id}`} className="text-sm cursor-pointer">
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Guide */}
      <Card className="border-border/50 shadow-sm bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Creating Approval Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Choose Rule Type</p>
                <p className="text-sm text-muted-foreground">
                  Select between Sequential, Percentage, Specific Approver, or Hybrid
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-3">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Set Threshold & Approvers</p>
                <p className="text-sm text-muted-foreground">
                  Define expense amount threshold and assign approvers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-3">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Configure Conditions</p>
                <p className="text-sm text-muted-foreground">
                  Set approval conditions and enable the rule
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalRules;
