"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { routePaths } from "@/config/navigation";
import { mapLoginToSession, type BackendLoginData } from "@/lib/auth/map-session";
import { useAuthStore } from "@/stores";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("admin@crm.com");
  const [password, setPassword] = useState("Admin@123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get("redirect") ?? routePaths.dashboard;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Static login bypass — no backend call needed
      const staticPayload: BackendLoginData = {
        accessToken: "static-dev-token",
        refreshToken: "static-dev-refresh",
        user: {
          _id: "000000000000000000000001",
          name: "Admin User",
          email,
          isActive: true,
          role: {
            _id: "000000000000000000000001",
            name: "Admin",
            slug: "admin",
            permissions: {},
          },
        },
      };

      setSession(mapLoginToSession(staticPayload));
      toast.success("Signed in successfully");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-[6px] bg-primary shadow-subtle">
          <span className="text-lg font-bold text-primary-foreground">C</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to {siteConfig.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your credentials to access the admin panel
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[6px] border border-border/60 bg-card p-6 shadow-card"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </motion.div>
  );
}

function LoginFormFallback() {
  return (
    <div className="w-full space-y-4 rounded-[6px] border border-border/60 bg-card p-6 shadow-card">
      <Skeleton className="mx-auto size-12 rounded-[6px]" />
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
