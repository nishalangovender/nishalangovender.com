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
          background: "#040405",
          color: "#EEF4F9",
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
              color: "#33E1FF",
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
              color: "#8598AB",
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
                color: "#657382",
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
              background: "#33E1FF",
              color: "#040405",
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
