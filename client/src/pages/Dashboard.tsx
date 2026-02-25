import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  Bell,
  User,
  LogOut
} from "lucide-react";
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-provider";

export default function Dashboard() {
  const { logout, user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: () => dashboardApi.getTrends(),
  });

  function pctChange(data: any[] | undefined, key: string) {
    if (!data || data.length < 2) return '-';
    const first = Number(data[0][key]);
    const last = Number(data[data.length - 1][key]);
    if (!isFinite(first) || first === 0) return '-';
    const change = ((last - first) / Math.abs(first)) * 100;
    const rounded = Math.round(change);
    return `${rounded > 0 ? '+' : ''}${rounded}%`;
  }

  const { data: accuracy, isLoading: accuracyLoading } = useQuery({
    queryKey: ["dashboard-accuracy"],
    queryFn: dashboardApi.getAccuracyMetrics
  });

  const { data: recentActivities, isLoading: recentLoading, isError: recentError } = useQuery({
    queryKey: ["dashboard-recent-activities"],
    queryFn: dashboardApi.getRecentActivities,
  });

  const metricsSectionLoading = metricsLoading;

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1e] min-h-screen text-zinc-100 font-sans">
      {/* Header / Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            className="bg-[#161e31] border-zinc-800 pl-10 h-10 rounded-lg text-sm focus:ring-cyan-500/20" 
            placeholder="Search alerts, IOCs, threat intel..." 
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

      {/* Welcome Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Security Operations Dashboard</h1>
        <p className="text-sm text-zinc-500">Real-time threat monitoring and analytics</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-4">
        {metricsSectionLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-[#161e31] border-zinc-800 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-zinc-800 rounded-lg w-9 h-9 animate-pulse" />
                  <div className="h-4 w-10 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
        <Card className="bg-[#161e31] border-zinc-800 shadow-xl group">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {metrics?.totalCasesTrend}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tighter text-white">{metrics?.totalCases.toLocaleString()}</p>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Cases</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161e31] border-zinc-800 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="p-2 bg-amber-500/10 rounded-lg w-fit">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tighter text-white">{metrics?.openCases}</p>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">Open Cases</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161e31] border-zinc-800 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg w-fit">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tighter text-white">{metrics?.closedCases.toLocaleString()}</p>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">Closed Cases</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161e31] border-zinc-800 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg w-fit">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tighter text-white">{metrics?.mttd}</p>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">MTTD</p>
              <p className="text-[9px] text-zinc-600 mt-0.5 italic">Mean Time to Detect</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161e31] border-zinc-800 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tighter text-white">{metrics?.mttr}</p>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">MTTR</p>
              <p className="text-[9px] text-zinc-600 mt-0.5 italic">Mean Time to Respond</p>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {trendsLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="bg-[#161e31] border-zinc-800 shadow-xl rounded-xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="h-64 w-full bg-zinc-800/50 rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
        <Card className="bg-[#161e31] border-zinc-800 shadow-xl rounded-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Detection Time Trend</h3>
                <p className="text-[11px] text-zinc-500">Mean Time to Detect (MTTD)</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 rotate-180" /> {pctChange(trends, 'mttd')} vs last month
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends ?? []}>
                  <defs>
                    <linearGradient id="colorMttd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1425', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mttd" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorMttd)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161e31] border-zinc-800 shadow-xl rounded-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Response Time Trend</h3>
                <p className="text-[11px] text-zinc-500">Mean Time to Respond (MTTR)</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 rotate-180" /> {pctChange(trends, 'mttr')} vs last month
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends ?? []}>
                  <defs>
                    <linearGradient id="colorMttr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1425', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mttr" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorMttr)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Accuracy and Activity Row */}
      <div className="flex flex-col gap-8">
        <Card className="bg-[#161e31] border-zinc-800 shadow-xl rounded-xl">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-white">Detection Accuracy Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {accuracyLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#111827] border border-zinc-800 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-7 w-12 bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
                  </div>
                ))
              ) : (
                <>
              <div className="bg-[#111827] border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-zinc-300">True Positive</p>
                  <p className="text-2xl font-bold text-emerald-500">{accuracy?.truePositive.count}</p>
                </div>
                <Progress value={parseFloat(accuracy?.truePositive.percentage ?? '0') || 0} className="h-2 bg-zinc-800" />
                <p className="text-[10px] text-zinc-500 font-medium">{accuracy?.truePositive.percentage} of total detections</p>
              </div>

              <div className="bg-[#111827] border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-zinc-300">False Positive</p>
                  <p className="text-2xl font-bold text-amber-500">{accuracy?.falsePositive.count}</p>
                </div>
                <Progress value={parseFloat(accuracy?.falsePositive.percentage ?? '0') || 0} className="h-2 bg-zinc-800" />
                <p className="text-[10px] text-zinc-500 font-medium">{accuracy?.falsePositive.percentage} of total detections</p>
              </div>

              <div className="bg-[#111827] border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-zinc-300">Benign Positive</p>
                  <p className="text-2xl font-bold text-blue-500">{accuracy?.benignPositive.count}</p>
                </div>
                <Progress value={parseFloat(accuracy?.benignPositive.percentage ?? '0') || 0} className="h-2 bg-zinc-800" />
                <p className="text-[10px] text-zinc-500 font-medium">{accuracy?.benignPositive.percentage} of total detections</p>
              </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alert Activity */}
        <Card className="bg-[#161e31] border-zinc-800 shadow-xl rounded-xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-white">Recent Alert Activity</h3>
            {recentLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 bg-[#111827] border border-zinc-800 rounded-lg animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-full max-w-[200px] bg-zinc-800 rounded" />
                        <div className="h-3 w-16 bg-zinc-800 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentError ? (
              <p className="text-xs text-rose-500">Unable to load recent activity.</p>
            ) : (
              <div className="space-y-3">
                {(recentActivities ?? []).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-[#111827] border border-zinc-800 rounded-lg hover:bg-[#161e31] transition-colors group cursor-default"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                          activity.type === "high"
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                            : activity.type === "completed"
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : activity.type === "medium"
                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                        )}
                      />
                      <div className="space-y-0.5">
                        <p className="text-[12px] font-medium text-zinc-200 line-clamp-1">
                          {activity.title}
                        </p>
                        <p className="text-[10px] text-zinc-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {Array.isArray(recentActivities) && recentActivities.length === 0 && (
                  <p className="text-xs text-zinc-500">No recent activity found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}