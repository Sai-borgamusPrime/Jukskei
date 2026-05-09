import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PROFILE_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export function useAuthProfile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async (userId) => {
    const profileRequest = supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    const { data, error: profileError } = await withTimeout(
      profileRequest,
      PROFILE_TIMEOUT_MS,
      "Profile request timed out. Check your profiles RLS policy."
    );

    if (profileError) {
      throw profileError;
    }

    return data;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAuth() {
      setLoading(true);
      setError("");

      try {
        if (!supabase?.auth) {
          throw new Error("Supabase client is not configured correctly.");
        }

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const currentSession = data?.session || null;

        if (cancelled) return;

        setSession(currentSession);

        if (!currentSession?.user?.id) {
          setProfile(null);
          return;
        }

        const loadedProfile = await fetchProfile(currentSession.user.id);

        if (cancelled) return;

        console.log("Logged-in user:", currentSession.user.email);
        console.log("Loaded profile:", loadedProfile);

        setProfile(loadedProfile);
      } catch (err) {
        console.error("useAuthProfile failed:", err);

        if (!cancelled) {
          setError(err.message || "Could not load authentication profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return;

      setSession(newSession || null);

      if (!newSession?.user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      fetchProfile(newSession.user.id)
        .then((loadedProfile) => {
          if (cancelled) return;
          setProfile(loadedProfile);
          setError("");
        })
        .catch((err) => {
          console.error("Auth state profile reload failed:", err);
          if (cancelled) return;
          setError(err.message || "Could not reload user profile.");
          setProfile(null);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    profile,
    loading,
    error,
    isLoggedIn: Boolean(session?.user),
    isSuperAdmin: profile?.role === "super_admin",
  };
}