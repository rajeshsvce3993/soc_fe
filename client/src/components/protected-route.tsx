import { useAuth } from "./auth-provider";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {() => isAuthenticated ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
}
