"use client";

import { Button } from "@winnow/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function OnboardingSignOut({ label }: { label: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/sign-in");
      }}
    >
      {label}
    </Button>
  );
}
