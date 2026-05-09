"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

interface SubscribeFormProps {
  dict: Record<string, unknown>;
  siteName: string;
}

export function SubscribeForm({ dict, siteName }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const title = t(dict as never, "subscribe.title", { siteName });
  const placeholder = t(dict as never, "subscribe.placeholder");
  const buttonText = t(dict as never, "subscribe.button");
  const successText = t(dict as never, "subscribe.success");
  const privacyText = t(dict as never, "subscribe.privacy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/3 p-5 text-center">
      <h3 className="font-heading font-semibold text-sm mb-3">{title}</h3>
      {submitted ? (
        <p className="text-sm text-primary font-medium">{successText}</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85 active:bg-primary/75 transition-colors"
          >
            {buttonText}
          </button>
        </form>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground/50">{privacyText}</p>
    </div>
  );
}
