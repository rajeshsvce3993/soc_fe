import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type UpdateAlertRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAlerts() {
  return useQuery({
    queryKey: [api.alerts.list.path],
    queryFn: async () => {
      const res = await fetch(api.alerts.list.path);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return api.alerts.list.responses[200].parse(await res.json());
    },
  });
}

export function useAlert(id: number) {
  return useQuery({
    queryKey: [api.alerts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.alerts.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch alert");
      return api.alerts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAlertRequest }) => {
      const url = buildUrl(api.alerts.update.path, { id });
      const validated = api.alerts.update.input.parse(data);
      
      const res = await fetch(url, {
        method: api.alerts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to update alert");
      return api.alerts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.metrics.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.classification.path] });
      toast({
        title: "Alert Updated",
        description: "The alert status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
