"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractAuthFromCallback, saveAuthToken } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = extractAuthFromCallback(searchParams);

    if (auth) {
      saveAuthToken(auth);
      router.replace("/");
    } else {
      router.replace("/login?error=auth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}
