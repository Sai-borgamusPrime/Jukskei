import { useEffect, useState } from "react";
import { subscribeToPublicTables } from "../services/publicApi";

export function usePublicQuery(loader, dependencies = [], realtimeTables = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let reloadTimer = null;

    const load = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      setError("");

      try {
        const result = await loader();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("Public data load failed:", err);

        if (!cancelled) {
          setError(err.message || "Could not load content.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load(true);

    const unsubscribe = subscribeToPublicTables(realtimeTables, () => {
      window.clearTimeout(reloadTimer);
      reloadTimer = window.setTimeout(() => load(false), 300);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(reloadTimer);
      unsubscribe?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    reload: () => loader().then(setData),
  };
}
