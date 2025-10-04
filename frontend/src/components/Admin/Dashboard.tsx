import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewExpenseModal from "@/components/Admin/NewExpenseModal";
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Receipt,
  Loader2,
} from "lucide-react";


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// Debug: Log the API URL
console.log("🔗 API Base URL:", API_BASE_URL);

// Types
interface Expense {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
  } | string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalExpenses: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  totalCount: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API call helper (without auth for now)
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };


  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's expenses from backend
        const expensesResponse = await apiCall("/expenses/my");
        const allExpenses: Expense[] = expensesResponse.expenses || [];

        // Get recent 4 expenses
        const recentExpensesData = allExpenses.slice(0, 4);
        setRecentExpenses(recentExpensesData);

        // Calculate stats from expenses data
        const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const pendingCount = allExpenses.filter((e) => e.status === "Pending").length;

        // Get approved this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const approvedThisMonth = allExpenses.filter(
          (e) =>
            e.status === "Approved" &&
            new Date(e.updatedAt || e.createdAt) >= startOfMonth
        ).length;

        setStats({
          totalExpenses: totalAmount,
          pendingApprovals: pendingCount,
          approvedThisMonth: approvedThisMonth,
          totalCount: allExpenses.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      title: "Total Expenses",
      value: `$${stats?.totalExpenses?.toLocaleString() || "0"}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals?.toString() || "0",
      change: "Waiting",
      trend: "neutral" as const,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Approved This Month",
      value: stats?.approvedThisMonth?.toString() || "0",
      change: "+8.2%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Total Claims",
      value: stats?.totalCount?.toString() || "0",
      change: "+5.1%",
      trend: "up" as const,
      icon: Users,
      color: "text-accent",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-warning/10 text-warning hover:bg-warning/20",
      approved: "bg-success/10 text-success hover:bg-success/20",
      rejected: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    };
    return variants[status.toLowerCase() as keyof typeof variants] || variants.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getEmployeeName = (employee: Expense["employee"]) => {
    if (typeof employee === "string") return "You";
    return employee?.name || "You";
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-2 font-semibold">Error loading dashboard</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    // Re-fetch dashboard data
    setLoading(true);
    setError(null);
    setStats(null);
    setRecentExpenses([]);
    // Trigger useEffect by changing a state or simply call the fetch function again
    // Here, we'll just call the fetch function again for simplicity
    (async () => {
      try {
        // Fetch user's expenses from backend
        const expensesResponse = await apiCall("/expenses/my");
        const allExpenses: Expense[] = expensesResponse.expenses || [];
        
        // Get recent 4 expenses
        const recentExpensesData = allExpenses.slice(0, 4);
        setRecentExpenses(recentExpensesData);
        // Calculate stats from expenses data
        const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const pendingCount = allExpenses.filter((e) => e.status === "Pending").length;
        
        // Get approved this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const approvedThisMonth = allExpenses.filter(
          (e) =>
            e.status === "Approved" &&
            new Date(e.updatedAt || e.createdAt) >= startOfMonth
        ).length;
        setStats({
          totalExpenses: totalAmount,
          pendingApprovals: pendingCount,
          approvedThisMonth: approvedThisMonth,
          totalCount: allExpenses.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your expense overview.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New Expense</Button>

      <NewExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleRefresh}
      />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : stat.trend === "neutral" ? (
                      <Clock className="h-4 w-4 text-warning" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                    )}
                    <span
                      className={
                        stat.trend === "up"
                          ? "text-success"
                          : stat.trend === "neutral"
                            ? "text-warning"
                            : "text-destructive"
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Expenses */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent"
              onClick={() => (window.location.href = "/expenses")}
            >
              View all
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No expenses yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your first expense to get started
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/expenses/new")}
              >
                Create Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-accent flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {expense.currency} {expense.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <Badge className={getStatusBadge(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;