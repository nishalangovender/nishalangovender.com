"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/lib/constants";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formspreeId = siteConfig.formspreeId;
    if (!formspreeId) {
      setStatus("error");
      setErrorMessage(
        "The contact form isn't configured yet. Please email me directly instead.",
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

  return (
    <PageSection maxWidth="max-w-3xl">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Get In Touch</Eyebrow>
        </motion.div>

        <motion.h1
          className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
          variants={fadeUp}
        >
          Let&apos;s Build Something
        </motion.h1>

        <motion.div
          className="circuit-divider max-w-xs mt-6"
          variants={fadeUp}
        />

        <motion.p
          className="mt-6 text-muted text-lg leading-relaxed max-w-xl"
          variants={fadeUp}
        >
          Whether it&apos;s a robotics role, an embedded systems problem, or a
          full-stack build, I&apos;d love to hear from you. Send a message
          below or reach out directly.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6"
          variants={fadeUp}
          noValidate
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="font-mono text-xs uppercase tracking-wider text-muted"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                disabled={status === "submitting"}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-mono text-xs uppercase tracking-wider text-muted"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={status === "submitting"}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="font-mono text-xs uppercase tracking-wider text-muted"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              disabled={status === "submitting"}
              className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent disabled:opacity-60 resize-y min-h-[9rem]"
            />
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
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send Message"}
            </button>

            <p
              role="status"
              aria-live="polite"
              className="font-mono text-sm min-h-[1.25rem]"
            >
              {status === "success" && (
                <span className="text-accent">
                  Message sent — I&apos;ll reply soon.
                </span>
              )}
              {status === "error" && (
                <span className="text-red-500">{errorMessage}</span>
              )}
            </p>
          </div>
        </motion.form>
      </motion.div>
    </PageSection>
  );
}
