import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { investigationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Activity, FileText, ShieldCheck, AlertTriangle, PenSquare } from "lucide-react";

const mockInvestigation = {
  alertName: "Unusual Login Failure from Admin Account",
  id: "CASE-1243",
  severity: "High",
  createdAt: "14:23 UTC",
  assignedTo: "Alice Chen",
  sourceIp: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Unknown OS)",
  status: "In Progress",
};

const mockRawLogs = [
  "[2026-02-23T14:21:02Z] auth-service WARN Failed login for user admin from 192.168.1.100",
  "[2026-02-23T14:21:07Z] auth-service WARN Failed login for user admin from 192.168.1.100",
  "[2026-02-23T14:21:13Z] auth-service WARN Failed login for user admin from 192.168.1.100",
  "[2026-02-23T14:21:30Z] edge-firewall INFO Connection attempt flagged as suspicious (rule: brute_force_login)",
];

export default function Investigations() {
  const [match, params] = useRoute("/investigations/:id");
  const id = params?.id;

  const { data: timeline = [], isLoading: timelineLoading, isError: timelineError } = useQuery({
    queryKey: ["investigation-timeline", id],
    queryFn: () => investigationsApi.getTimeline(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Investigation Center</h2>
          <p className="text-muted-foreground">
            Select an alert from the Alerts console to start an investigation or view case details.
          </p>
          <Link href="/alerts">
            <Button className="mt-4">Go to Alerts Console</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#0a0f1e] min-h-screen text-zinc-100 font-sans">
      <Link href="/alerts">
        <Button variant="ghost" className="pl-0 text-zinc-400 hover:text-cyan-400 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Alerts
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Investigation - {mockInvestigation.alertName}
          </h1>
          <p className="text-xs text-zinc-500">
            Case ID {mockInvestigation.id} · Linked alert {id} · Severity{" "}
            <span className="text-amber-400 font-semibold">{mockInvestigation.severity}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="raw" className="space-y-4">
        <TabsList className="bg-[#111827] border border-zinc-800 rounded-lg px-1 py-1">
          <TabsTrigger value="raw" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            Raw Logs
          </TabsTrigger>
          <TabsTrigger value="ioc" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            IOC Extraction
          </TabsTrigger>
          <TabsTrigger value="intel" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            Threat Intel
          </TabsTrigger>
          <TabsTrigger value="summary" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            Summary
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            Notes
          </TabsTrigger>
          <TabsTrigger value="verdict" className="data-[state=active]:bg-[#0b1120] data-[state=active]:text-cyan-400">
            Verdict
          </TabsTrigger>
        </TabsList>

        <TabsContent value="raw">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-3">
                {timelineLoading ? (
                  <>
                    <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
                    <div className="bg-[#020617] border border-zinc-800 rounded-lg p-3 space-y-2 max-h-72">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-3 bg-zinc-800 rounded animate-pulse w-full" style={{ width: `${80 - i * 10}%` }} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                <h3 className="font-semibold text-sm text-zinc-200 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Raw Authentication Logs
                </h3>
                <div className="bg-[#020617] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 space-y-1 max-h-72 overflow-auto">
                  {mockRawLogs.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
                  </>
                )}
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>

        <TabsContent value="ioc">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-sm text-zinc-200 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Extracted Indicators of Compromise
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#020617] border border-zinc-800 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      IP Addresses
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-100">{mockInvestigation.sourceIp}</span>
                        <span className="text-red-400 text-[10px] font-semibold">Suspicious</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-100">10.0.0.5</span>
                        <span className="text-emerald-400 text-[10px] font-semibold">Clean</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#020617] border border-zinc-800 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      User Agents
                    </p>
                    <div className="space-y-2 text-xs">
                      <p className="font-mono text-zinc-100">{mockInvestigation.userAgent}</p>
                      <p className="text-amber-400 text-[11px]">Unusual user agent seen for this account</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>

        <TabsContent value="intel">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-sm text-zinc-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Threat Intelligence Findings (Mock)
                </h3>
                <ul className="list-disc list-inside text-xs text-zinc-300 space-y-2">
                  <li>
                    Source IP {mockInvestigation.sourceIp} has 3 prior entries in threat feeds for{" "}
                    <span className="text-amber-300">credential stuffing activity</span>.
                  </li>
                  <li>
                    User agent pattern matches known <span className="text-amber-300">automation toolkit</span>.
                  </li>
                  <li>
                    No confirmed malware C2 domains observed in this session.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-sm text-zinc-200 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  AI‑Generated Initial Summary (Mock)
                </h3>
                <div className="space-y-3 text-xs text-zinc-300">
                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Incident Overview</p>
                    <p>
                      Multiple failed login attempts detected from IP {mockInvestigation.sourceIp} targeting an
                      administrative account. The pattern suggests automated credential stuffing using common
                      username/password combinations.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Risk Assessment</p>
                    <p>
                      This activity represents a <span className="text-amber-300 font-semibold">HIGH</span> severity
                      threat. Successful compromise could lead to elevated access to critical systems.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200 mb-1">Recommended Actions</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Immediately block IP {mockInvestigation.sourceIp} at the firewall.</li>
                      <li>Force password reset for the targeted account.</li>
                      <li>Ensure MFA is enforced for all privileged users.</li>
                      <li>Monitor for additional suspicious logins from related IP ranges.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-zinc-200 flex items-center gap-2">
                    <PenSquare className="w-4 h-4 text-cyan-400" />
                    Investigation Notes
                  </h3>
                  <Button size="sm" className="h-8 bg-cyan-600 hover:bg-cyan-500 text-xs px-3">
                    Add Note
                  </Button>
                </div>
                <div className="bg-[#020617] border border-zinc-800 rounded-lg p-4 text-xs space-y-1">
                  <p className="font-semibold text-zinc-200">Alice Chen · 14:45 UTC</p>
                  <p className="text-zinc-300">
                    Confirmed brute force attack pattern. IP has been added to blocklist. Coordinating with IAM
                    team to enforce password reset and MFA.
                  </p>
                </div>
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>

        <TabsContent value="verdict">
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 bg-[#111827] border-zinc-800">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-sm text-zinc-200 mb-2">Final Determination (Mock)</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <button className="flex flex-col items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-left hover:bg-emerald-500/20 transition">
                    <span className="text-sm font-semibold text-emerald-400">True Positive</span>
                    <span className="text-[11px] text-emerald-100">Confirmed threat</span>
                  </button>
                  <button className="flex flex-col items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-left hover:bg-amber-500/15 transition">
                    <span className="text-sm font-semibold text-amber-300">False Positive</span>
                    <span className="text-[11px] text-amber-100">Benign activity</span>
                  </button>
                  <button className="flex flex-col items-start gap-2 rounded-lg border border-blue-500/40 bg-blue-500/5 px-4 py-3 text-left hover:bg-blue-500/15 transition">
                    <span className="text-sm font-semibold text-blue-300">Escalate</span>
                    <span className="text-[11px] text-blue-100">Requires review</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-300">Verdict Notes</p>
                  <Textarea
                    className="min-h-[120px] bg-[#020617] border-zinc-800 text-xs text-zinc-100"
                    placeholder="Enter your determination and reasoning (mock textarea, not persisted)..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300">
                    Cancel
                  </Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
                    Submit Verdict (Mock)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <TimelineCard timeline={timeline} isLoading={timelineLoading} isError={timelineError} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimelineCard({
  timeline,
  isLoading,
  isError,
}: {
  timeline: Array<{ label: string; description: string; time: string; status: string }>;
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <Card className="bg-[#111827] border-zinc-800">
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold text-sm text-zinc-200 mb-1">Investigation Timeline</h3>
        {isLoading && (
          <p className="text-xs text-zinc-500">Loading timeline...</p>
        )}
        {isError && !isLoading && (
          <p className="text-xs text-rose-500">Unable to load timeline.</p>
        )}
        {!isLoading && !isError && (
          <div className="space-y-3 text-xs">
            {timeline.length === 0 ? (
              <p className="text-zinc-500">No timeline events yet.</p>
            ) : (
              timeline.map((step, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span
                      className={
                        "mt-1 h-2 w-2 rounded-full shrink-0 " +
                        (step.status === "done"
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          : "bg-zinc-600")
                      }
                    />
                    <div>
                      <p className="font-semibold text-zinc-100">{step.label}</p>
                      <p className="text-[11px] text-zinc-500">{step.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 shrink-0">{step.time}</span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
