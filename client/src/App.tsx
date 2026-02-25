import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Alerts from "@/pages/Alerts";
import Investigations from "@/pages/Investigations";
import Users from "@/pages/Users";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <ProtectedRoute path="/" component={() => (
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      )} />
      
      <ProtectedRoute path="/alerts" component={() => (
        <AuthenticatedLayout>
          <Alerts />
        </AuthenticatedLayout>
      )} />
      
      <ProtectedRoute path="/investigations" component={() => (
        <AuthenticatedLayout>
          <Investigations />
        </AuthenticatedLayout>
      )} />
      
      <ProtectedRoute path="/investigations/:id" component={() => (
        <AuthenticatedLayout>
          <Investigations />
        </AuthenticatedLayout>
      )} />

      <ProtectedRoute path="/users" component={() => (
        <AuthenticatedLayout>
          <Users />
        </AuthenticatedLayout>
      )} />
      
      <ProtectedRoute path="/reports" component={() => (
        <AuthenticatedLayout>
          <div className="p-8 text-muted-foreground">Reports Module - Coming Soon</div>
        </AuthenticatedLayout>
      )} />
      
      <ProtectedRoute path="/settings" component={() => (
        <AuthenticatedLayout>
          <div className="p-8 text-muted-foreground">Settings Module - Coming Soon</div>
        </AuthenticatedLayout>
      )} />
      
      <Route path="/:rest*">
        {isAuthenticated ? <NotFound /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
