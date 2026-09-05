"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { FiSend, FiCheck, FiAlertCircle } from "react-icons/fi";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="admin-input"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="admin-input"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your project..."
          rows={5}
          required
          className="admin-input resize-none"
        />
      </div>
      <motion.button
        type="submit"
        disabled={status === "sending"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`admin-btn w-full flex items-center justify-center gap-2 py-3 text-sm ${
          status === "success" ? "!bg-green-600" : status === "error" ? "!bg-red-600" : ""
        }`}
      >
        {status === "idle" && (
          <>
            <FiSend size={16} /> Send Message
          </>
        )}
        {status === "sending" && (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        )}
        {status === "success" && (
          <>
            <FiCheck size={16} /> Sent successfully!
          </>
        )}
        {status === "error" && (
          <>
            <FiAlertCircle size={16} /> Failed. Please try again.
          </>
        )}
      </motion.button>
    </form>
  );
}
