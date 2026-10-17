"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { showPlaceholders } from "@/lib/placeholders";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };
type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ enabled, fallbackEmail }: { enabled: boolean; fallbackEmail: string | null }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  if (!enabled) {
    return (
      <div className="border border-line p-6 text-[14px] leading-relaxed text-muted">
        <p>
          The contact form isn’t active yet.{" "}
          {fallbackEmail ? (
            <>
              Please email{" "}
              <a className="text-fg underline underline-offset-4" href={`mailto:${fallbackEmail}`}>
                {fallbackEmail}
              </a>{" "}
              directly.
            </>
          ) : (
            "Please use the links on this page to get in touch."
          )}
        </p>
        {showPlaceholders && (
          <p className="mt-4 font-mono text-[11px] text-amber-200/80 light:text-amber-800">
            [Placeholder] Set RESEND_API_KEY and CONTACT_TO_EMAIL (see README → Contact form) to enable real delivery.
          </p>
        )}
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errs: Errors = {};
    if (!data.name?.trim()) errs.name = "Please enter your name.";
    if (!EMAIL_RE.test(data.email ?? "")) errs.email = "Please enter a valid email address.";
    if (!data.subject?.trim()) errs.subject = "Please add a subject.";
    if ((data.message ?? "").trim().length < 10) errs.message = "Please write a message of at least 10 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, elapsed: Date.now() - startedAt.current }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      setStatus({ kind: "sent" });
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="border border-line p-8">
        <Check size={20} strokeWidth={1.5} />
        <p className="mt-4 text-lg font-medium">Message sent.</p>
        <p className="mt-1 text-[14px] text-muted">Thank you — I’ll get back to you as soon as I can.</p>
        <button className="btn-ghost mt-6" onClick={() => setStatus({ kind: "idle" })}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field name="name" label="Name" autoComplete="name" error={errors.name} />
      <Field name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <Field name="subject" label="Subject" className="sm:col-span-2" error={errors.subject} />
      <Field name="message" label="Message" textarea className="sm:col-span-2" error={errors.message} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? (
            <>
              Sending <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              Send message <ArrowRight size={16} strokeWidth={1.5} />
            </>
          )}
        </button>
        <p role="status" aria-live="polite" className="text-[13px] text-red-300/90 light:text-red-700">
          {status.kind === "error" && status.message}
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  textarea,
  className = "",
  autoComplete,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  className?: string;
  autoComplete?: string;
  error?: string;
}) {
  const id = `contact-${name}`;
  const cls = `peer w-full border-b bg-transparent py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-faint focus:border-fg ${
    error ? "border-red-400/70 light:border-red-600/70" : "border-line-strong"
  }`;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={5} className={`${cls} resize-y`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} maxLength={5000} />
      ) : (
        <input id={id} name={name} type={type} autoComplete={autoComplete} className={cls} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} maxLength={200} />
      )}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-[12px] text-red-300/90 light:text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
