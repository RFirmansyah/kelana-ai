"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          background: "#0d1117",
          color: "#f3f4f6",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#161b22",
            padding: 40,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 56 }}>🧭</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            KelanaAI hit a snag
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, maxWidth: 280 }}>
            Something went wrong loading the application. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
