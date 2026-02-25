import { z } from 'zod';
import { insertUserSchema, insertAlertSchema, insertIncidentSchema, Alert, Incident, User } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Dashboard Metrics
  dashboard: {
    metrics: {
      method: 'GET' as const,
      path: '/api/dashboard/metrics',
      responses: {
        200: z.object({
          totalCases: z.number(),
          openCases: z.number(),
          closedCases: z.number(),
          mttd: z.string(), // Formatted string e.g., "40m 9s"
          mttr: z.string(),
          mttdValue: z.number(), // Raw seconds
          mttrValue: z.number(), // Raw seconds
        }),
      },
    },
    trends: {
      method: 'GET' as const,
      path: '/api/dashboard/trends',
      responses: {
        200: z.array(z.object({
          date: z.string(),
          mttd: z.number(),
          mttr: z.number(),
          openCases: z.number(),
          closedCases: z.number(),
        })),
      },
    },
    classification: {
      method: 'GET' as const,
      path: '/api/dashboard/classification',
      responses: {
        200: z.object({
          distribution: z.array(z.object({
            name: z.string(), // Disposition
            value: z.number(),
          })),
          history: z.array(z.object({
            date: z.string(),
            truePositive: z.number(),
            falsePositive: z.number(),
            benignPositive: z.number(),
          })),
        }),
      },
    }
  },

  // Alerts Management
  alerts: {
    list: {
      method: 'GET' as const,
      path: '/api/alerts',
      responses: {
        200: z.array(z.custom<Alert & { assigneeName?: string }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/alerts/:id',
      responses: {
        200: z.custom<Alert>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/alerts/:id',
      input: insertAlertSchema.partial(),
      responses: {
        200: z.custom<Alert>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Incidents
  incidents: {
    list: {
      method: 'GET' as const,
      path: '/api/incidents',
      responses: {
        200: z.array(z.custom<Incident>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/incidents/:id',
      responses: {
        200: z.custom<Incident>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Users (for management)
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<User>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        200: z.custom<User>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
