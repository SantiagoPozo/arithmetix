import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthApiError, type Session } from "@supabase/supabase-js";

import { AuthContext } from "@/auth/AuthContext";
import {
  mapUserProfile,
  mapUserProfileInput,
  type SaveUserProfileInput,
  type UserProfile,
} from "@/auth/profile";
import type { AppUser, AuthContextValue, AuthState } from "@/auth/types";
import { supabase } from "@/supabase";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileState, setProfileState] =
    useState<AuthContextValue["profileState"]>("idle");
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = async (userId: string) => {
    setProfileState("loading");

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, alias, birth_year, country_code, city, bio, school_name, created_at, updated_at",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      setProfile(null);
      setProfileState("error");
      setError(profileError);
      throw profileError;
    }

    if (!data) {
      setProfile(null);
      setProfileState("missing");
      return;
    }

    setProfile(mapUserProfile(data));
    setProfileState("ready");
  };

  const resetProfileState = () => {
    setProfile(null);
    setProfileState("idle");
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!isMounted) {
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user as AppUser);
          setState("authenticated");
          setError(null);
          await loadProfile(currentSession.user.id);
          return;
        }

        setSession(null);
        setUser(null);
        resetProfileState();
        setState("unauthenticated");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setState("error");
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Unable to initialize auth session."),
        );
      }
    };

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) {
        return;
      }

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user as AppUser);
        setState("authenticated");
        setError(null);
        void loadProfile(currentSession.user.id);
        return;
      }

      setSession(null);
      setUser(null);
      resetProfileState();
      setState("unauthenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setState("loading");
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user as AppUser);
        setState("authenticated");
        setError(null);
        await loadProfile(data.session.user.id);
        return;
      }

      setSession(null);
      setUser(null);
      resetProfileState();
      setState("unauthenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Email sign-in failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setState("loading");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user as AppUser);
        setState("authenticated");
        setError(null);
        await loadProfile(data.session.user.id);
        return;
      }

      setSession(null);
      setUser(null);
      resetProfileState();
      setState("unauthenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Email sign-up failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      setState("loading");
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (caughtError) {
      const nextError =
        caughtError instanceof AuthApiError
          ? caughtError
          : new Error("Google sign-in failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const signInWithMagicLink = async (email: string, redirectTo?: string) => {
    try {
      setState("loading");
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            redirectTo ?? `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      });

      if (magicLinkError) {
        throw magicLinkError;
      }

      setState(session ? "authenticated" : "unauthenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Magic link sign-in failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const requestPasswordReset = async (email: string, redirectTo?: string) => {
    try {
      setState("loading");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            redirectTo ?? `${window.location.origin}/auth/reset-password`,
        },
      );

      if (resetError) {
        throw resetError;
      }

      setState(session ? "authenticated" : "unauthenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Password reset request failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setState("loading");
      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      if (data.user) {
        setUser(data.user as AppUser);
      }

      setState("authenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Password update failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const signOut = async () => {
    try {
      setState("loading");
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setSession(null);
      setUser(null);
      resetProfileState();
      setState("unauthenticated");
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Sign out failed.");

      setError(nextError);
      setState("error");
      throw nextError;
    }
  };

  const saveProfile = async (input: SaveUserProfileInput) => {
    if (!user) {
      throw new Error("You must be authenticated to save a profile.");
    }

    setProfileState("loading");

    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert(mapUserProfileInput(user.id, input), {
        onConflict: "id",
      })
      .select(
        "id, alias, birth_year, country_code, city, bio, school_name, created_at, updated_at",
      )
      .single();

    if (saveError) {
      setProfileState(profile ? "ready" : "missing");
      throw saveError;
    }

    setProfile(mapUserProfile(data));
    setProfileState("ready");
    setError(null);
  };

  const refreshProfile = async () => {
    if (!user) {
      resetProfileState();
      return;
    }

    await loadProfile(user.id);
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      state,
      session,
      user,
      profile,
      profileState,
      error,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithMagicLink,
      requestPasswordReset,
      updatePassword,
      signOut,
      saveProfile,
      refreshProfile,
      isAuthenticated: state === "authenticated",
      hasProfile: profileState === "ready",
      isLoading: state === "loading" || profileState === "loading",
    }),
    [state, session, user, profile, profileState, error],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
