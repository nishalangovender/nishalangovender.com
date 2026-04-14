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
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#0A0A0A",
          color: "#E5E5E5",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#3B82F6",
              margin: 0,
            }}
          >
            Error · Fatal
          </p>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "2.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Something Went Very Wrong
          </h1>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1rem",
              color: "#A3A3A3",
              lineHeight: 1.6,
            }}
          >
            The application crashed before it could render. Please reload the
            page — if it keeps happening, please reach out so I can fix it.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "1.5rem",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#737373",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
