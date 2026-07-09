import type { Session, User } from "@supabase/supabase-js";

import type { SaveUserProfileInput, UserProfile } from "@/auth/profile";

export type AuthState =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export type AppUser = User;

export type ProfileState = "idle" | "loading" | "ready" | "missing" | "error";

export interface AuthContextValue {
  state: AuthState;
  session: Session | null;
  user: AppUser | null;
  profile: UserProfile | null;
  profileState: ProfileState;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<void>;
  requestPasswordReset: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (input: SaveUserProfileInput) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isLoading: boolean;
}
