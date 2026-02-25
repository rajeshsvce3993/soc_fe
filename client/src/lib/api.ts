const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("soc_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Auth failed (${resp.status})`);
    }

    const data = await resp.json();
    return data;
  },

  signup: async (payload: { name: string; email: string; password: string; mobile?: string; role?: string }) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Signup failed (${resp.status})`);
    }

    return await resp.json();
  },

  forgotPassword: async (email: string) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Forgot password failed (${resp.status})`);
    }

    try {
      return await resp.json();
    } catch {
      return null;
    }
  },

  sendOtp: async (email: string) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Send OTP failed (${resp.status})`);
    }

    return await resp.json();
  },

  verifyOtp: async (email: string, otp: string) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, otp }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Verify OTP failed (${resp.status})`);
    }

    return await resp.json();
  },

  updatePassword: async (email: string, newPassword: string) => {
    const resp = await fetch(`${BASE_API_URL}/api/auth/update-password`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, newPassword }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Update password failed (${resp.status})`);
    }

    return await resp.json();
  },
};

export const usersApi = {
  list: async () => {
    const resp = await fetch(`${BASE_API_URL}/api/users`, {
      headers: authHeaders(),
    });
    if (!resp.ok) throw new Error(`Failed to fetch users (${resp.status})`);
    const payload = await resp.json();
    // backend returns { success: true, data: [...] }
    if (payload && typeof payload === "object" && Array.isArray(payload.data)) return payload.data;
    // fallback: if API returns array directly
    if (Array.isArray(payload)) return payload;
    return [];
  },
  create: async (payload: { name: string; email: string; password: string; mobile?: string; role?: string }) => {
    // user creation is handled by auth/signup endpoint (requires Authorization header)
    const resp = await fetch(`${BASE_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Create user failed (${resp.status})`);
    }
    return await resp.json();
  },

  listOnlyUsers: async () => {
    const resp = await fetch(`${BASE_API_URL}/api/users/only-users`, {
      headers: authHeaders(),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Failed to fetch assignable users (${resp.status})`);
    }
    const payload = await resp.json();
    if (payload && typeof payload === "object" && Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  },
};

export const rolesApi = {
  list: async () => {
    // mock roles endpoint - in future this can fetch from `${BASE_API_URL}/api/roles`
    await new Promise((r) => setTimeout(r, 120));
    return [
      { value: "user", label: "User" },
      { value: "admin", label: "Administrator" }
    ];
  }
};

export const dashboardApi = {
  getMetrics: async () => {
    try {
      const resp = await fetch(`${BASE_API_URL}/api/dashboard/getmetrics`, {
        headers: authHeaders(),
      });
      if (!resp.ok) throw new Error(`Failed to fetch metrics (${resp.status})`);
      const payload = await resp.json();
      // expected shape: { success: true, data: { ...metrics } }
      if (payload && payload.data) return payload.data;
      return {};
    } catch (err) {
      // fallback to previous mock if backend unavailable
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        totalCases: 0,
        totalCasesTrend: "0",
        openCases: 0,
        closedCases: 0,
        mttd: 0,
        mttr: 0,
      };
    }
  },
  getTrends: async (opts?: { points?: number; days?: number }) => {
    const points = opts?.points ?? 10;
    const days = opts?.days ?? 30;
    try {
      const resp = await fetch(`${BASE_API_URL}/api/dashboard/gettrends?points=${points}&days=${days}`, {
        headers: authHeaders(),
      });
      if (!resp.ok) throw new Error(`Failed to fetch trends (${resp.status})`);
      const payload = await resp.json();
      // expected shape: { success: true, data: { series: [...] } }
      if (payload && payload.data && Array.isArray(payload.data.series)) return payload.data.series;
      // if API returns array directly
      if (Array.isArray(payload)) return payload;
      // fallback to mock generation if no usable data
    } catch (err) {
      // ignore and fallback to mock below
    }

    // fallback mock
    // await new Promise((resolve) => setTimeout(resolve, 500));
    // return Array.from({ length: points }).map((_, i) => ({
    //   time: `${i * 2}h`,
    //   mttd: Math.floor(Math.random() * 40) + 10,
    //   mttr: Math.floor(Math.random() * 60) + 20,
    // }));
  },
  getAccuracyMetrics: async () => {
    try {
      const resp = await fetch(`${BASE_API_URL}/api/dashboard/detection-accuracy`, {
        headers: authHeaders(),
      });
      if (!resp.ok) throw new Error(`Failed to fetch accuracy metrics (${resp.status})`);
      const payload = await resp.json();
      if (payload && payload.data) return payload.data;
    } catch (err) {
      // ignore and fallback to mock below
    }

    // await new Promise((resolve) => setTimeout(resolve, 500));
    // return {
    //   truePositive: { count: 892, percentage: "71.5%" },
    //   falsePositive: { count: 287, percentage: "23%" },
    //   benignPositive: { count: 68, percentage: "5.5%" },
    // };
  },

  getRecentActivities: async () => {
    const resp = await fetch(`${BASE_API_URL}/api/dashboard/recent-activities`, {
      headers: authHeaders(),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Failed to fetch recent activities (${resp.status})`);
    }
    const payload = await resp.json();
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }
};

export const alertsApi = {
  getAlerts: async (opts?: { limit?: number; skip?: number }) => {
    const limit = opts?.limit ?? 10;
    const skip = opts?.skip ?? 0;

    const resp = await fetch(`${BASE_API_URL}/api/alerts?limit=${limit}&skip=${skip}`, {
      headers: authHeaders(),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Failed to fetch alerts (${resp.status})`);
    }

    const payload = await resp.json();

    if (payload && typeof payload === "object") {
      const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
      return {
        items,
        total: typeof payload.total === "number" ? payload.total : items.length,
        limit: typeof payload.limit === "number" ? payload.limit : limit,
        skip: typeof payload.skip === "number" ? payload.skip : skip,
      };
    }

    // fallback if API returns array directly
    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        limit,
        skip,
      };
    }

    return { items: [], total: 0, limit, skip };
  },

  updateAlert: async (id: string, updates: any) => {
    const resp = await fetch(`${BASE_API_URL}/api/alerts/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Failed to update alert (${resp.status})`);
    }

    return await resp.json();
  },
};

export const investigationsApi = {
  getTimeline: async (investigationId: string) => {
    const resp = await fetch(
      `${BASE_API_URL}/api/investigations/${investigationId}/timeline`,
      { headers: authHeaders() }
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Failed to fetch investigation timeline (${resp.status})`);
    }

    const payload = await resp.json();
    if (payload && typeof payload === "object" && Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  },
};
