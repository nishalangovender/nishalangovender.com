"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { siteConfig } from "@/lib/constants";

type FormStatus = "idle" | "submitting" | "success" | "error";

/**
 * Inline "Request Full CV" form — sits at the top of the /cv page above the
 * public profile content. Submits to the same Formspree endpoint as the
 * contact form but with a distinct `_subject` so Nish can filter inbox
 * notifications and manually reply with the appropriate CV variant
 * (SA, NL, or tailored for the role).
 */
export default function CvRequestForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formspreeId = siteConfig.formspreeId;
    if (!formspreeId) {
      setStatus("error");
      setErrorMessage(
        "The request form isn't configured yet. Please email me directly instead.",
      );
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        const payload = (await response.json().catch(() => null)) as
          | { errors?: { message?: string }[] }
          | null;
        const message =
          payload?.errors?.[0]?.message ??
          "Something went wrong. Please try again or email me directly.";
        setStatus("error");
        setErrorMessage(message);
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-accent-light/40 p-6 sm:p-8">
        <Eyebrow size="small">Request Received</Eyebrow>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
          Thanks — I&apos;ll Be In Touch Shortly
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          I review every request personally and reply with the CV variant best
          suited to your role and location. You can expect a response within
          one or two business days.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-surface p-6 sm:p-8">
      <Eyebrow size="small">Request Full CV</Eyebrow>
      <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
        Prefer The Complete CV?
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        The page below is a public profile. For the complete CV — including
        detailed technical work and the version tailored to your region or
        role — send a short request and I&apos;ll reply personally.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {/* Distinct subject so CV requests are filterable from contact messages */}
        <input type="hidden" name="_subject" value="CV Request" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="cv-name"
              className="font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              Name<span className="text-accent"> *</span>
            </label>
            <input
              id="cv-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              disabled={status === "submitting"}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cv-email"
              className="font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              Email<span className="text-accent"> *</span>
            </label>
            <input
              id="cv-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={status === "submitting"}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cv-company"
              className="font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              Company
            </label>
            <input
              id="cv-company"
              name="company"
              type="text"
              autoComplete="organization"
              disabled={status === "submitting"}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cv-role"
              className="font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              Role / Position
            </label>
            <input
              id="cv-role"
              name="role"
              type="text"
              autoComplete="organization-title"
              disabled={status === "submitting"}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
            />
          </div>
        </div>

        {/* Honeypot field to deter bots — Formspree recognises `_gotcha` */}
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="sm" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Request CV"}
          </Button>

          <p
            role="status"
            aria-live="polite"
            className="font-mono text-xs min-h-[1rem]"
          >
            {status === "error" && (
              <span className="text-red-500">{errorMessage}</span>
            )}
            {status === "idle" && (
              <span className="text-muted">
                Typical Reply Within 1–2 Business Days
              </span>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
