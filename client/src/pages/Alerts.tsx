import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi, usersApi } from "@/lib/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Bell,
  User,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-provider";

// Manual cn helper since we're in a single file edit
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["alerts", { page, pageSize }],
    queryFn: () =>
      alertsApi.getAlerts({
        limit: pageSize,
        skip: (page - 1) * pageSize,
      }),
    // React Query v5: use placeholderData instead of keepPreviousData
    placeholderData: (previousData) => previousData,
  });

  const alerts = data?.items ?? [];
  const total = data?.total ?? alerts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const {
    data: assignableUsers,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["alerts-assignable-users"],
    queryFn: usersApi.listOnlyUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      alertsApi.updateAlert(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Update Successful",
        description: "Alert has been updated correctly."
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1e] min-h-screen text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            className="bg-[#161e31] border-zinc-800 pl-10 h-10 rounded-lg text-sm focus:ring-cyan-500/20" 
            placeholder="Search alerts, IOCs, threat intel..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name ?? 'Guest'}</p>
              <p className="text-[10px] text-zinc-500">{user?.email ?? ''}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-cyan-500/20 cursor-pointer hover:border-cyan-500 transition-colors">
                  <AvatarFallback className="bg-cyan-600 text-white font-bold">{(user?.name || 'G').split(' ').map(n=>n[0]).slice(0,2).join('')}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-[#161e31] border-zinc-800 text-zinc-100">
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-rose-500 focus:text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Alerts</h1>
          <p className="text-sm text-zinc-500">Monitor and respond to security incidents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-[#161e31] border-zinc-800 text-zinc-400 hover:text-white h-10">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Filters Bar (Hidden as requested) */}
      {/* 
      <div className="flex items-center justify-between pb-4">
        ...
      </div>
      */}

      {/* Alerts Table */}
      <div className="bg-[#111827] border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-[#161e31]/50 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider py-4">Alert Name</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Severity</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider w-[300px]">Description</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Assigned To</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider">Disposition</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !data ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-zinc-800/50">
                  <TableCell className="py-5"><div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-5 w-16 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-28 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-20 bg-zinc-800 rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : !isError && alerts?.map((alert: any) => (
              <TableRow key={alert.id} className="border-zinc-800/50 hover:bg-[#161e31]/30 transition-colors group">
                <TableCell className="py-5 font-bold text-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    {alert.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("px-3 py-0.5 rounded-full text-[10px] font-bold border", getSeverityColor(alert.severity))}>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm leading-relaxed truncate">
                  {alert.description}
                </TableCell>
                <TableCell>
                  {(() => {
                    const rawStatus = (alert.status ?? "").toString();
                    const normalizedStatus = rawStatus.toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
                    const currentStatus =
                      normalizedStatus === "open" ||
                      normalizedStatus === "in_progress" ||
                      normalizedStatus === "closed" ||
                      normalizedStatus === "new"
                        ? normalizedStatus
                        : "new";

                    return (
                      <Select
                        defaultValue={currentStatus}
                        onValueChange={(val) =>
                          updateMutation.mutate({
                            id: alert.id,
                            updates: { status: val },
                          })
                        }
                      >
                        <SelectTrigger className="w-[140px] bg-[#161e31] border-zinc-800 text-zinc-300 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-300">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={
                      (assignableUsers || []).find((u: any) => u.name === alert.assignedTo)?.email ||
                      "none"
                    }
                    onValueChange={(value) => {
                      if (value === "none") {
                        updateMutation.mutate({
                          id: alert.id,
                          updates: { assignedTo: "None", assignedToEmail: null },
                        });
                        return;
                      }
                      const user = (assignableUsers || []).find((u: any) => u.email === value);
                      if (!user) return;
                      updateMutation.mutate({
                        id: alert.id,
                        updates: {
                          assignedTo: user.name,
                          assignedToEmail: user.email,
                        },
                      });
                    }}
                    disabled={usersLoading || usersError}
                  >
                    <SelectTrigger className="w-[160px] bg-[#161e31] border-zinc-800 text-zinc-300 h-8 text-xs">
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "None"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-300">
                      <SelectItem value="none">None</SelectItem>
                      {(assignableUsers || []).map((u: any) => (
                        <SelectItem key={u._id ?? u.email} value={u.email}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {(() => {
                    const rawDisposition = (alert.disposition ?? "").toString().toLowerCase();
                    let currentDisposition: string = "none";
                    if (rawDisposition === "true_positive") currentDisposition = "true_positive";
                    else if (rawDisposition === "false_positive") currentDisposition = "false_positive";
                    else if (rawDisposition === "benign_positive") currentDisposition = "benign_positive";
                    else if (rawDisposition === "escalated") currentDisposition = "escalated";

                    return (
                      <Select
                        defaultValue={currentDisposition}
                        onValueChange={(val) => {
                          if (val === "none") {
                            updateMutation.mutate({
                              id: alert.id,
                              updates: { disposition: null },
                            });
                            return;
                          }
                          updateMutation.mutate({
                            id: alert.id,
                            updates: { disposition: val },
                          });
                        }}
                      >
                        <SelectTrigger className="w-[160px] bg-[#161e31] border-zinc-800 text-zinc-300 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-300">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="true_positive">True Positive</SelectItem>
                          <SelectItem value="false_positive">False Positive</SelectItem>
                          <SelectItem value="benign_positive">Benign Positive</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      className="h-8 bg-cyan-600 text-white text-[11px] font-bold px-4 rounded-md opacity-40 cursor-not-allowed"
                      disabled
                    >
                      Investigate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!alerts || alerts.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-zinc-500">
                  {isError ? "Unable to load alerts." : "No alerts found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-[#0d1220] text-[12px] text-zinc-400">
          <div>
            {isLoading && !data ? (
              <span>Loading alerts...</span>
            ) : total > 0 ? (
              <span>
                Showing{" "}
                <span className="text-zinc-200">
                  {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of <span className="text-zinc-200">{total}</span> alerts
              </span>
            ) : (
              <span>No alerts to display</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 bg-transparent border-zinc-700 text-zinc-300 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              Previous
            </Button>
            <span className="text-[11px] text-zinc-400">
              Page <span className="text-zinc-200">{page}</span> of{" "}
              <span className="text-zinc-200">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 bg-transparent border-zinc-700 text-zinc-300 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
