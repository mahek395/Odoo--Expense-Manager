import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Plus, Eye, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ExpenseStatus = "Pending" | "Approved" | "Rejected";

interface Expense {
  _id: string;
  employee: { _id?: string; name?: string } | string;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  status: ExpenseStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    if (!token) {
      toast({ title: "Not authorized", description: "No token found", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // expecting { expenses: [...] }
        setExpenses(data.expenses || []);
      } else {
        toast({ title: "Error", description: data.message || "Failed to fetch expenses", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch expenses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const updateStatus = async (id: string, status: ExpenseStatus) => {
    if (!token) {
      toast({ title: "Not authorized", description: "No token found", variant: "destructive" });
      return;
    }
    if (!confirm(`Confirm ${status} for this expense?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }), // send 'Approved' or 'Rejected' per your Expense model
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: `Expense ${status}` });
        fetchExpenses();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update status", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const filtered = expenses.filter((exp) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesQ =
      !q ||
      exp._id.toLowerCase().includes(q) ||
      (typeof exp.employee === "string"
        ? exp.employee.toLowerCase().includes(q)
        : (exp.employee as any).name?.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  const totalAmount = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const pendingCount = filtered.filter((e) => e.status === "Pending").length;
  const approvedCount = filtered.filter((e) => e.status === "Approved").length;

  const getStatusClass = (status: ExpenseStatus) => {
    switch (status) {
      case "Approved": return "bg-emerald-500/10 text-emerald-500";
      case "Rejected": return "bg-red-500/10 text-red-500";
      default: return "bg-amber-500/10 text-amber-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage expense claims</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { /* open modal to create */ }}>
            <Plus className="w-4 h-4 mr-2" /> New Expense
          </Button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-3xl">${totalAmount.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* filters */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by ID or employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2" onClick={() => {
            // simple CSV export
            const rows = [
              ["ID","Employee","Category","Date","Amount","Status"],
              ...filtered.map(e => [
                e._id,
                typeof e.employee === "string" ? e.employee : (e.employee as any).name || "",
                e.category,
                new Date(e.date).toLocaleDateString(),
                `${e.currency || ""} ${e.amount}`,
                e.status
              ])
            ];
            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `expenses-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </CardContent>
      </Card>

      {/* table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Expense Claims</CardTitle>
          <CardDescription>{filtered.length} expense{filtered.length !== 1 ? "s" : ""} found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No expenses found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((exp) => (
                    <TableRow key={exp._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{exp._id}</TableCell>
                      <TableCell>{typeof exp.employee === "string" ? exp.employee : (exp.employee as any).name || "—"}</TableCell>
                      <TableCell>{exp.category}</TableCell>
                      <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-semibold">{exp.currency ? `${exp.currency} ` : ""}${exp.amount.toFixed(2)}</TableCell>
                      <TableCell><Badge className={getStatusClass(exp.status)}>{exp.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View details" onClick={() => alert(exp.description || "No description")}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {exp.status === "Pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-emerald-500" title="Approve" onClick={() => updateStatus(exp._id, "Approved")}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" title="Reject" onClick={() => updateStatus(exp._id, "Rejected")}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExpenses;
