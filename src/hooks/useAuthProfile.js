import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuthProfile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!cancelled) {
          setSession(data.session || null);
        }
      } catch (err) {
        console.error("Session load failed:", err);
        if (!cancelled) {
          setError(err.message || "Session load failed.");
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setProfileReady(false);
      setError("");

      if (!session?.user?.id) {
        setProfile(null);
        setProfileReady(true);
        return;
      }

      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name, role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!cancelled) {
          setProfile(data || null);
        }
      } catch (err) {
        console.error("Profile load failed:", err);
        if (!cancelled) {
          setError(err.message || "Profile load failed.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileReady(true);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return {
    session,
    profile,
    loading: !authReady || !profileReady,
    error,
    isLoggedIn: Boolean(session?.user),
    isSuperAdmin: profile?.role === "super_admin",
  };
}