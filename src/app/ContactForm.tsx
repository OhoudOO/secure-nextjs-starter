"use client";

import { useState, type FormEvent } from "react";

// Client-side checks are for convenience only; the server validates again with the same schema.
export default function ContactForm() {
  const [status, setStatus] = useState<string>("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data: { error?: string } = await response.json();
    setStatus(response.ok ? "Thanks, your message was sent." : (data.error ?? "Something went wrong."));
  }

  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Name" required minLength={2} maxLength={100} />
      <input name="email" type="email" placeholder="Email" required maxLength={254} />
      <textarea name="message" placeholder="Message" required minLength={10} maxLength={5000} />
      <button type="submit">Send</button>
      <p role="status">{status}</p>
    </form>
  );
}
