import type { AuthSession } from "@/types/auth";

export const DEV_AUTH_SESSION: AuthSession = {
  user: {
    id: "usr_dev_001",
    email: "admin@crm.local",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  tokens: {
    accessToken: "dev_access_token",
    refreshToken: "dev_refresh_token",
    expiresIn: 3600,
  },
};
