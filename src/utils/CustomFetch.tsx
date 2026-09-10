import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CustomFetch() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const oFetch = window.fetch;

    window.fetch = async (...args) => {
      const resp = await oFetch(...args);

      if (resp.status === 401) {
        console.warn("Unauthorized request detected! Redirecting to login...");
        router.push("/?error=Session+expired.+Please+log+in+again.");
        return undefined;
      }

      return resp;
    };

    return () => {
      window.fetch = oFetch;
    };
  }, [router]);

  return null;
}
