import { useAuth } from "@/auth/useAuth";

interface HallOfFameAccess {
  requiresLogin: boolean;
}

export function useHallOfFameAccess(
  required: boolean = true,
): HallOfFameAccess {
  const { isAuthenticated, state } = useAuth();

  if (required && state !== "loading" && !isAuthenticated) {
    return { requiresLogin: true };
  }

  return { requiresLogin: false };
}
