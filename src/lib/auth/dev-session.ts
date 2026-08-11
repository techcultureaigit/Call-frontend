import type { AuthSession } from "@/types/auth";
import { createFullPermissions } from "@/config/permission-modules";

/** Local fallback only when backend is unreachable during UI work */
export const DEV_AUTH_SESSION: AuthSession = {
  user: {
    id: "usr_dev_001",
    email: "admin@crm.com",
    firstName: "Admin",
    lastName: "User",
    roleId: "role_dev_admin",
    roleName: "Admin",
    role: "Admin",
    // Must include create/update/delete or list Edit/Copy/Delete stay hidden
    permissions: createFullPermissions(),
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
