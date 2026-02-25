import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: [api.dashboard.metrics.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.metrics.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
      return api.dashboard.metrics.responses[200].parse(await res.json());
    },
  });
}

export function useDashboardTrends() {
  return useQuery({
    queryKey: [api.dashboard.trends.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.trends.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard trends");
      return api.dashboard.trends.responses[200].parse(await res.json());
    },
  });
}

export function useDashboardClassification() {
  return useQuery({
    queryKey: [api.dashboard.classification.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.classification.path);
      if (!res.ok) throw new Error("Failed to fetch classification metrics");
      return api.dashboard.classification.responses[200].parse(await res.json());
    },
  });
}
